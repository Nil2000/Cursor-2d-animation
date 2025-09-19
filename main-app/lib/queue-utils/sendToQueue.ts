import { getProducer } from "./queueProducer";
export async function sendToQueue(message: string, key: string) {
  try {
    const producer = await getProducer();
    if (!producer) {
      throw new Error("Producer is not initialized");
    }

    await producer.send({
      topic: process.env.KAFKA_TOPIC || "default-topic",
      messages: [{ key, value: message }],
    });
  } catch (error: any) {
    console.error("Error sending message to queue:", error.message);
    console.log(error.stack);
  }
}
