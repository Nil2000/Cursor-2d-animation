import axios from "axios";
import { runCodeInDocker } from "./sandbox/runCodeInDocker";
import { uploadToS3Bucket } from "./storage/uploadToS3bucket";
import fs from "fs";

export async function processMessage(message: string) {
  console.log("Processing message:", message);
  const tempDir = __dirname + "/temp";
  console.log("Temporary directory:", tempDir);
  const { key, value } = JSON.parse(message);
  if (!key || !value) {
    throw new Error("Invalid message format: key and value are required");
  }
  try {
    // Run the code in Docker container
    const status = await runCodeInDocker(value);
    console.log("Code execution status:", status);

    if (status.status === "error") {
      console.error("Error running code in Docker:", status.error);
      return;
    }

    // Upload the output video to S3 bucket
    const uploadStatus = await uploadToS3Bucket(status.output!, key);
    if (uploadStatus.status === "error") {
      console.error("Error uploading to S3 bucket:", uploadStatus.error);
      return;
    }

    // Update the video status in the API
    await axios.post(`${process.env.API_URL}/video_status/${key}`, {
      url: uploadStatus.url,
      status: "completed",
    });

    // Clean up temporary files
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (error: any) {
    console.error("Error processing message:", error);
    // Update the video status in the API with failure
    await axios.post(`${process.env.API_URL}/video_status/${key}`, {
      url: "",
      status: "failed",
    });
  }
}
