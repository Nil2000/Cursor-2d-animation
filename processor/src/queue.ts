import { Kafka } from "kafkajs";

const getKafkaConsumer = () => {
  const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || "default-client",
    brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  });
  const cosumer = kafka.consumer({
    groupId: process.env.KAFKA_GROUP_ID || "default-group",
  });
  return cosumer;
};

type Props = {
  topic: string;
  onMessage: (message: string) => Promise<void>;
};

export const startConsumingMessages = async ({ topic, onMessage }: Props) => {
  const consumer = getKafkaConsumer();
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        offset: message.offset,
        value: JSON.stringify(message),
        topic,
        partition,
      });

      if (message.value) {
        onMessage(JSON.stringify(message)).catch((error) => {
          console.error("Error processing message:", error.message);
          console.log(error.stack);
        });
      }
    },
  });

  console.log(`Started consuming messages from topic: ${topic}`);
};
