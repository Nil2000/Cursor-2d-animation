import Redis from "ioredis";

const getRedisClient = () => {
  return new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  });
};

type Props = {
  queueName: string;
  onMessage: (message: string) => Promise<void>;
};

export const startConsumingMessages = async ({
  queueName,
  onMessage,
}: Props) => {
  const client = getRedisClient();

  // Test connection
  await client.ping();
  console.log("Connected to Redis");

  console.log(`Started consuming messages from queue: ${queueName}`);

  // Continuously poll for messages
  while (true) {
    try {
      // Use BRPOP for blocking pop (wait for message)
      const result = await client.brpop(queueName, 10); // 10 second timeout

      if (result) {
        const [, message] = result;
        console.log({
          queue: queueName,
          message: message,
        });

        if (message) {
          await onMessage(message).catch((error) => {
            console.error("Error processing message:", error.message);
            console.log(error.stack);
          });
        }
      }
    } catch (error: any) {
      console.error("Error in queue consumption:", error.message);
      console.log(error.stack);
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};
