import { runCodeInDocker } from "./sandbox/runCodeInDocker";

export async function processMessage(message: string) {
  try {
    console.log("Processing message:", message);
    const tempDir = __dirname + "/temp";
    console.log("Temporary directory:", tempDir);
    const { key, value } = JSON.parse(message);
    if (!key || !value) {
      throw new Error("Invalid message format: key and value are required");
    }

    const status = await runCodeInDocker(value);
    console.log("Code execution status:", status);

    //TODO: Store in object storage
    //TODO: Update video status in database via API call
  } catch (error: any) {
    console.error("Error processing message:", error);
  }
}
