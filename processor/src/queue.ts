import Redis from "ioredis";

let redisClient: Redis | null = null;

const getRedisClient = () => {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL must be set");
  }

  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL);
  }

  return redisClient;
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

  console.log("Connected to Redis");
  console.log(`Started consuming messages from queue: ${queueName}`);

  while (true) {
    try {
      // Use BLPOP for blocking queue consumption
      const result = await client.blpop(queueName, 10); // 10 second timeout
      
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
