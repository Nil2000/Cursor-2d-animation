import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import { uploadToS3Bucket } from "../storage/uploadToS3bucket";

const execAsync = promisify(exec);
const tempDir = __dirname + "/temp";

// Helper function to clean up temporary files and directories recursively
const cleanupTempFiles = (dirPath: string) => {
  try {
    if (fs.existsSync(dirPath)) {
      const cleanupRecursively = (currentDirPath: string) => {
        const items = fs.readdirSync(currentDirPath);
        items.forEach((item) => {
          const itemPath = `${currentDirPath}/${item}`;
          const stat = fs.statSync(itemPath);
          if (stat.isDirectory()) {
            // Recursively clean subdirectories
            cleanupRecursively(itemPath);
            fs.rmdirSync(itemPath);
          } else {
            // Delete files
            fs.unlinkSync(itemPath);
          }
        });
      };

      const initialItems = fs.readdirSync(dirPath);
      cleanupRecursively(dirPath);
      console.log(
        `Cleaned up ${initialItems.length} temporary items (files and directories) recursively`
      );
    }
  } catch (cleanupError) {
    console.error("Error during cleanup:", cleanupError);
  }
};

export async function runCodeInDocker(code: string, key: string) {
  fs.mkdirSync(tempDir, { recursive: true });
  fs.writeFileSync(`${tempDir}/code.py`, code);

  const dockerCmd = `docker run --rm -v "${tempDir}:/manim" manimcommunity/manim manim -qm code.py`;
  try {
    // console.log("Running Docker command:", dockerCmd);
    const result = await execAsync(dockerCmd);

    // console.log("Docker command output:", result.stdout);
    if (result.stderr) {
      console.error("Docker command error output:", result.stderr);
    }

    // Checking files are present in temp directory
    console.log(
      "Checking files are present in temp directory in runCodeInDocker"
    );
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      console.log("Files in temp directory:", files);
    }

    const outputFileDir = `${tempDir}/media/videos/code/720p30`;

    // Check if the output directory exists (created by Manim)
    if (!fs.existsSync(outputFileDir)) {
      throw new Error(`Output directory not found: ${outputFileDir}`);
    }

    const files = fs.readdirSync(outputFileDir);
    console.log("Files in output directory:", files);

    for (const file of files) {
      if (file.endsWith(".mp4")) {
        const fullPath = `${outputFileDir}/${file}`;
        console.log("Found output video file:", fullPath);

        // Verify file exists and has content
        const stats = fs.statSync(fullPath);
        console.log("File size:", stats.size, "bytes");

        // Upload the output video to S3 bucket
        const uploadStatus = await uploadToS3Bucket(fullPath, key);
        if (uploadStatus.status === "error") {
          throw new Error(`S3 upload failed: ${uploadStatus.error}`);
        }

        // Clean up temporary files after successful upload
        cleanupTempFiles(tempDir);

        return {
          status: "success",
          output: fullPath,
          uploadUrl: uploadStatus.url,
          tempDir: tempDir,
        };
      }
    }
    throw new Error("No output video file found in the expected directory.");
  } catch (error: any) {
    console.log("Error in runCodeInDocker:", error.message);
    // Clean up temporary files even on error
    cleanupTempFiles(tempDir);
    return {
      status: "error",
      error: error.message,
    };
  }
}
