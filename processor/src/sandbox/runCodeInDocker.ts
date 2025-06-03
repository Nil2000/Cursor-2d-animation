import { exec } from "child_process";
import fs from "fs";
const tempDir = __dirname + "/temp";
export async function runCodeInDocker(code: string) {
  fs.writeFileSync(`${tempDir}/code.py`, code);

  const dockerCmd = `docker run --rm -v ${tempDir}:/manim manimcommunity/manim manim -qm code.py`;
  try {
    return await new Promise((resolve, reject) => {
      exec(dockerCmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing code: ${error.message}`);
          reject(error);
        } else if (stderr) {
          console.error(`Error in code execution: ${stderr}`);
          reject(new Error(stderr));
        } else {
          console.log(`Code executed successfully: ${stdout}`);
          const outputDir = `${tempDir}/media/videos/code/480p60`;
          for (const file of fs.readdirSync(outputDir)) {
            if (file.endsWith(".mp4")) {
              resolve({
                status: "success",
                videoPath: `${outputDir}/${file}`,
              });
            }
          }
          reject(new Error("No output video file found"));
        }
      });
    });
  } catch (error: any) {
    return {
      status: "error",
      error: error.message,
    };
  }
}
