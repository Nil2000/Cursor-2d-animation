import { runCodeInDocker } from "./sandbox/runCodeInDocker";

export async function processMessage(message: string) {
  console.log("Processing message:", message);

  // Convert buffer to string if needed
  const { key, value } = JSON.parse(message);
  if (!key || !value) {
    throw new Error("Invalid message format: key and value are required");
  }
  const utf16Decoder = new TextDecoder("utf-8");

  const keyValue = utf16Decoder.decode(Buffer.from(key.data));
  const valueValue = utf16Decoder.decode(Buffer.from(value.data));
  console.log("Message key:", keyValue);
  console.log("Message value:", valueValue);
  try {
    // Run the code in Docker container
    const status = await runCodeInDocker(valueValue, keyValue);
    console.log("Code execution status:", status);

    if (status.status === "error") {
      console.error("Error running code in Docker:", status.error);
      throw new Error("Error running code in Docker: " + status.error);
    }

    // Update the video status in the API
    console.log("Updating video status for key:", keyValue);
    console.log("API URL:", `${process.env.API_URL}/video_status/${keyValue}`);
    console.log("Upload status URL:", status.uploadUrl);

    try {
      const response = await fetch(
        `${process.env.API_URL}/video_status/${keyValue}`,
        {
          method: "POST",
          headers: {
            "x-secret-key": process.env.INTERNAL_API_KEY!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: status.uploadUrl,
            status: "completed",
          }),
        }
      );

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
    // Update the video status in the API with failure
    await fetch(`${process.env.API_URL}/video_status/${keyValue}`, {
      method: "POST",
      headers: {
        "x-secret-key": process.env.INTERNAL_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "",
        status: "failed",
      }),
    });
  }
}
