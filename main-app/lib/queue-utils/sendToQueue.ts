/* eslint-disable @typescript-eslint/no-explicit-any */
import { getProducer } from "./queueProducer";

export async function sendToQueue(
  message: string,
  videos: Array<{ id: string; quality: string }>,
  chatId: string
) {
  try {
    const producer = await getProducer();
    if (!producer) {
      throw new Error("Producer is not initialized");
    }

    // Send a message for each video with quality info
    await producer.send({
      topic: process.env.KAFKA_TOPIC || "default-topic",
      messages: [
        {
          key: chatId,
          value: JSON.stringify({
            code: message,
            videos,
          }),
        },
      ],
    });
  } catch (error: any) {
    console.error("Error sending message to queue:", error.message);
    console.log(error.stack);
  }
}
