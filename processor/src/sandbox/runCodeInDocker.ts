import { exec } from "child_process";
import fs from "fs";
const tempDir = __dirname + "/temp";
export async function runCodeInDocker(code: string) {
  fs.mkdirSync(tempDir, { recursive: true });
  fs.writeFileSync(`${tempDir}/code.py`, code);

  const dockerCmd = `docker run --rm -v ${tempDir}:/manim manimcommunity/manim manim -qm code.py`;
  try {
    console.log("Running Docker command:", dockerCmd);
    const result = await new Promise<{ stdout: string; stderr: string }>(
      (resolve, reject) => {
        exec(dockerCmd, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve({ stdout, stderr });
          }
        });
      }
    );

    console.log("Docker command output:", result.stdout);
    if (result.stderr) {
      console.error("Docker command error output:", result.stderr);
    }

    const outputFileDir = `${tempDir}/media/videos/code/720p30`;
    for (const file of fs.readdirSync(outputFileDir)) {
      if (file.endsWith(".mp4")) {
        console.log("Output file path:", file);
        return {
          status: "success",
          output: `${outputFileDir}/${file}`,
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
