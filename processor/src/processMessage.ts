import { runCodeInDocker } from "./sandbox/runCodeInDocker";
import { processMessagePayloadSchema, type VideoPayload } from "./types";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export async function processMessage(message: string) {
  console.log("Processing message:", message);

  const parsedMessage = processMessagePayloadSchema.safeParse(
    JSON.parse(message),
  );

  if (!parsedMessage.success) {
    console.error("Invalid message payload:", parsedMessage.error.message);
    return;
  }

  const { chatId, code, videos } = parsedMessage.data;

  console.log("Message chatId:", chatId);
  console.log("Message code:", code);
  console.log("Message videos:", videos);

  try {
    const status = await runCodeInDocker(code, videos);
    console.log("Code execution status:", status);

    if (status.status === "error") {
      console.error("Error running code in Docker:", status.error);
      throw new Error("Error running code in Docker: " + status.error);
    }

    console.log("Updating video status for chatId:", chatId);
    console.log("API URL:", `${process.env.API_URL}/video_status`);
    console.log("Upload status URLs:", status.uploadUrls);

    if (!status.uploadUrls || status.uploadUrls.length === 0) {
      throw new Error("No upload URLs returned from Docker execution");
    }

    const response = await fetch(`${process.env.API_URL}/video_status`, {
      method: "POST",
      headers: {
        "x-secret-key": process.env.INTERNAL_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId,
        videoUrls: status.uploadUrls.map((upload: VideoPayload) => ({
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
    console.log("Video status update response:", response.status, responseData);
  } catch (error: unknown) {
    console.error("Error processing message:", error);

    try {
      const response = await fetch(`${process.env.API_URL}/video_status`, {
        method: "POST",
        headers: {
          "x-secret-key": process.env.INTERNAL_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          videoUrls: videos.map((video) => ({
            id: video.id,
            url: "",
            status: "failed" as const,
          })),
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`, {
          cause: error,
        });
      }
      const responseData = await response.json();
      console.log(
        "Video status update response:",
        response.status,
        responseData,
      );
    } catch (updateError: unknown) {
      console.error(
        "Error updating video status on failure:",
        getErrorMessage(updateError),
      );
    }
  }
}
