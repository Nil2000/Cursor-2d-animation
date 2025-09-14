import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec);
const tempDir = __dirname + "/temp";
export async function runCodeInDocker(code: string) {
  fs.mkdirSync(tempDir, { recursive: true });
  fs.writeFileSync(`${tempDir}/code.py`, code);

  const dockerCmd = `docker run --rm -v "${tempDir}:/manim" manimcommunity/manim manim -qm code.py`;
  try {
    console.log("Running Docker command:", dockerCmd);
    const result = await execAsync(dockerCmd);

    console.log("Docker command output:", result.stdout);
    if (result.stderr) {
      console.error("Docker command error output:", result.stderr);
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

        return {
          status: "success",
          output: fullPath,
          tempDir: tempDir,
        };
      }
    }
    throw new Error("No output video file found in the expected directory.");
  } catch (error: any) {
    console.log("Error in runCodeInDocker:", error.message);
    return {
      status: "error",
      error: error.message,
    };
  }
}
