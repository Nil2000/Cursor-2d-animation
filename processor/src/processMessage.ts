import { runCodeInDocker } from "./sandbox/runCodeInDocker";
import { uploadToS3Bucket } from "./storage/uploadToS3bucket";
import fs from "fs";

export async function processMessage(message: string) {
  console.log("Processing message:", message);
  const tempDir = __dirname + "/temp";
  console.log("Temporary directory:", tempDir);

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
    const status = await runCodeInDocker(valueValue);
    console.log("Code execution status:", status);

    if (status.status === "error") {
      console.error("Error running code in Docker:", status.error);
      return;
    }

    // Upload the output video to S3 bucket
    const uploadStatus = await uploadToS3Bucket(status.output!, keyValue);
    if (uploadStatus.status === "error") {
      console.error("Error uploading to S3 bucket:", uploadStatus.error);
      return;
    }

    // Update the video status in the API
    console.log("Updating video status for key:", keyValue);
    console.log("API URL:", `${process.env.API_URL}/video_status/${keyValue}`);
    console.log("Upload status URL:", uploadStatus.url);
    
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
            url: uploadStatus.url,
            status: "completed",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log("Video status update response:", response.status, responseData);
    } catch (error: any) {
      console.error("Error updating video status:");
      console.error("Error message:", error.message);
      throw error;
    }

    // Clean up temporary files
    try {
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        files.forEach((file) => {
          const filePath = `${tempDir}/${file}`;
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            fs.unlinkSync(filePath);
          }
        });
        console.log(`Cleaned up ${files.length} temporary files`);
      }
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
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
