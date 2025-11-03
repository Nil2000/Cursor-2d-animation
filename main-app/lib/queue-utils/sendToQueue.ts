/* eslint-disable @typescript-eslint/no-explicit-any */
import { pushToQueue } from "./queueProducer";

export async function sendToQueue(
  message: string,
  videos: Array<{ id: string; quality: string }>,
  chatId: string
) {
  try {
    // Send message to QStash queue
    await pushToQueue(
      process.env.QSTASH_TOPIC_NAME || "manim-queue",
      {
        chatId,
        code: message,
        videos,
      }
    );
  } catch (error: any) {
    console.error("Error sending message to queue:", error.message);
    console.log(error.stack);
  }
}
