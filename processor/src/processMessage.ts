import { runCodeInDocker } from "./sandbox/runCodeInDocker";

export async function processMessage(message: string) {
  console.log("Processing message:", message);

  // Parse Redis message format (simple JSON string)
  const { chatId, code, videos } = JSON.parse(message);
  
  if (!chatId || !code || !videos) {
    throw new Error("Invalid message format: chatId, code, and videos are required");
  }

  console.log("Message chatId:", chatId);
  console.log("Message code:", code);
  console.log("Message videos:", videos);

  try {
    // Run the code in Docker container
    const status = await runCodeInDocker(code, videos);
    console.log("Code execution status:", status);

    if (status.status === "error") {
      console.error("Error running code in Docker:", status.error);
      throw new Error("Error running code in Docker: " + status.error);
    }

    // Update the video status in the API
    console.log("Updating video status for chatId:", chatId);
    console.log("API URL:", `${process.env.API_URL}/video_status`);
    console.log("Upload status URLs:", status.uploadUrls);

    if (!status.uploadUrls || status.uploadUrls.length === 0) {
      throw new Error("No upload URLs returned from Docker execution");
    }

    try {
      const response = await fetch(`${process.env.API_URL}/video_status`, {
        method: "POST",
        headers: {
          "x-secret-key": process.env.INTERNAL_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: chatId,
          videoUrls: status.uploadUrls.map((upload: any) => ({
            id: upload.id,
            url: upload.url,
            status: "completed" as const,
          })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log(
        "Video status update response:",
        response.status,
        responseData
      );
    } catch (error: any) {
      console.error("Error updating video status:");
      console.error("Error message:", error.message);
      throw error;
    }
  } catch (error: any) {
    console.error("Error processing message:", error);
    // Update all video statuses in the API with failure
    try {
      await fetch(`${process.env.API_URL}/video_status`, {
        method: "POST",
        headers: {
          "x-secret-key": process.env.INTERNAL_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: chatId,
          videoUrls: videos.map((video: any) => ({
            id: video.id,
            url: "",
            status: "failed" as const,
          })),
        }),
      });
    } catch (updateError: any) {
      console.error("Error updating video status on failure:", updateError.message);
    }
  }
}
