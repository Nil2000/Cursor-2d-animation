import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { uploadToS3Bucket } from "../storage/uploadToS3bucket";

const execAsync = promisify(exec);
const DOCKER_TIMEOUT_MS = 15 * 60 * 1000;
const DOCKER_MEMORY_LIMIT = "2g";
const DOCKER_CPU_LIMIT = "2";

const getJobTempDir = () => {
  const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return path.join(__dirname, "temp", jobId);
};

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
        `Cleaned up ${initialItems.length} temporary items (files and directories) recursively`,
      );
    }
  } catch (cleanupError) {
    console.error("Error during cleanup:", cleanupError);
  }
};

// Helper function to generate lower quality videos using fluent-ffmpeg
const generateLowerQualityVideo = (
  inputPath: string,
  outputPath: string,
  height: number,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log(`Generating ${height}p video...`);
    ffmpeg(inputPath)
      .size(`?x${height}`)
      .videoCodec("libx264")
      .outputOptions(["-crf 23", "-preset medium"])
      .on("end", () => {
        console.log(`${height}p video generated successfully`);
        resolve();
      })
      .on("error", (err: Error) => {
        console.error(`Error generating ${height}p video:`, err.message);
        reject(err);
      })
      .save(outputPath);
  });
};

export async function runCodeInDocker(
  code: string,
  videoIds: Array<{ id: string; quality?: string }>,
) {
  const tempDir = getJobTempDir();
  fs.mkdirSync(tempDir, { recursive: true });
  fs.writeFileSync(path.join(tempDir, "code.py"), code);

  const dockerCmd = [
    "docker run --rm",
    `--memory=${DOCKER_MEMORY_LIMIT}`,
    `--cpus=${DOCKER_CPU_LIMIT}`,
    "--network=none",
    `-v "${tempDir}:/manim"`,
    "manimcommunity/manim",
    "manim -qh code.py",
  ].join(" ");
  try {
    // console.log("Running Docker command:", dockerCmd);
    const result = await execAsync(dockerCmd, {
      timeout: DOCKER_TIMEOUT_MS,
      killSignal: "SIGKILL",
      maxBuffer: 10 * 1024 * 1024,
    });

    // console.log("Docker command output:", result.stdout);
    if (result.stderr) {
      console.error("Docker command error output:", result.stderr);
    }

    // Checking files are present in temp directory
    console.log(
      "Checking files are present in temp directory in runCodeInDocker",
    );
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      console.log("Files in temp directory:", files);
    }

    const outputFileDir = path.join(
      tempDir,
      "media",
      "videos",
      "code",
      "1080p60",
    );

    // Check if the output directory exists (created by Manim)
    if (!fs.existsSync(outputFileDir)) {
      throw new Error(`Output directory not found: ${outputFileDir}`);
    }

    const files = fs.readdirSync(outputFileDir);
    console.log("Files in output directory:", files);

    for (const file of files) {
      if (file.endsWith(".mp4")) {
        const fullPath = path.join(outputFileDir, file);
        console.log("Found output video file:", fullPath);

        // Verify file exists and has content
        const stats = fs.statSync(fullPath);
        console.log("File size:", stats.size, "bytes");

        // Generate lower quality versions
        const video480pPath = path.join(
          outputFileDir,
          file.replace(".mp4", "_480p.mp4"),
        );
        const video144pPath = path.join(
          outputFileDir,
          file.replace(".mp4", "_144p.mp4"),
        );

        try {
          await generateLowerQualityVideo(fullPath, video480pPath, 480);
          await generateLowerQualityVideo(fullPath, video144pPath, 144);
        } catch (ffmpegError: unknown) {
          const message =
            ffmpegError instanceof Error
              ? ffmpegError.message
              : String(ffmpegError);
          console.error("Error generating lower quality videos:", message);
          throw new Error(`FFmpeg processing failed: ${message}`, {
            cause: ffmpegError,
          });
        }

        // Upload all three quality versions to S3
        console.log("Uploading high quality (1080p) video...");
        const uploadStatus1080p = await uploadToS3Bucket(
          fullPath,
          videoIds.find((video) => video.quality === "high")!.id! || "",
        );
        if (uploadStatus1080p.status === "error") {
          throw new Error(
            `S3 upload failed for 1080p: ${uploadStatus1080p.error}`,
          );
        }

        console.log("Uploading medium quality (480p) video...");
        const uploadStatus480p = await uploadToS3Bucket(
          video480pPath,
          videoIds.find((video) => video.quality === "medium")!.id! || "",
        );
        if (uploadStatus480p.status === "error") {
          throw new Error(
            `S3 upload failed for 480p: ${uploadStatus480p.error}`,
          );
        }

        console.log("Uploading low quality (144p) video...");
        const uploadStatus144p = await uploadToS3Bucket(
          video144pPath,
          videoIds.find((video) => video.quality === "low")!.id! || "",
        );
        if (uploadStatus144p.status === "error") {
          throw new Error(
            `S3 upload failed for 144p: ${uploadStatus144p.error}`,
          );
        }

        console.log("All quality versions uploaded successfully");

        // Clean up temporary files after successful upload
        cleanupTempFiles(tempDir);

        // Return only the high quality (1080p) URL
        return {
          status: "success",
          output: fullPath,
          uploadUrls: [
            {
              id: videoIds.find((video) => video.quality === "high")!.id! || "",
              quality: "high",
              url: uploadStatus1080p.url,
            },
            {
              id:
                videoIds.find((video) => video.quality === "medium")!.id! || "",
              quality: "medium",
              url: uploadStatus480p.url,
            },
            {
              id: videoIds.find((video) => video.quality === "low")!.id! || "",
              quality: "low",
              url: uploadStatus144p.url,
            },
          ],
          tempDir,
        };
      }
    }
    throw new Error("No output video file found in the expected directory.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.log("Error in runCodeInDocker:", message);
    return {
      status: "error",
      error: message,
    };
  } finally {
    // Clean up temporary files on every exit path
    cleanupTempFiles(tempDir);
  }
}
