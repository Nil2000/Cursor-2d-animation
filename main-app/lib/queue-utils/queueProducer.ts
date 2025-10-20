/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kafka, Producer } from "kafkajs";

let kafka_client: Kafka | null = null;
let producer: Producer | null = null;

export const getProducer = async () => {
  if (producer) {
    return producer;
  }

  try {
    if (!kafka_client) {
      kafka_client = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID || "default-client",
        brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
      });
    }

    producer = kafka_client.producer();
    await producer.connect();
    return producer;
  } catch (error: any) {
    console.error("Error creating Kafka producer:", error.message);
    console.log(error.stack);
    throw error;
  }
};
