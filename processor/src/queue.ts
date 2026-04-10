import Redis from "ioredis";

let redisClient: Redis | null = null;
let isShuttingDown = false;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const getRedisClient = () => {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL must be set");
  }

  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL);
  }

  return redisClient;
};

const shutdown = async (signal: string) => {
  console.log(`Received ${signal}, initiating graceful shutdown...`);
  isShuttingDown = true;

  if (redisClient) {
    try {
      await redisClient.quit();
      console.log("Redis connection closed gracefully");
    } catch (error) {
      console.error("Error closing Redis connection:", error);
    }
  }

  process.exit(0);
};

// Register signal handlers
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

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

  while (!isShuttingDown) {
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
    } catch (error: unknown) {
      if (isShuttingDown) break;

      console.error("Error in queue consumption:", getErrorMessage(error));
      console.log(error instanceof Error ? error.stack : undefined);
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};
