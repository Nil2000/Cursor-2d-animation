/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from "ioredis";

let redis_client: Redis | null = null;

export const getRedisClient = async () => {
  if (redis_client) {
    return redis_client;
  }

  try {
    if (!process.env.REDIS_URL) {
      throw new Error("REDIS_URL must be set");
    }

    redis_client = new Redis(process.env.REDIS_URL);

    console.log("Connected to Redis");
    return redis_client;
  } catch (error: any) {
    console.error("Error creating Redis client:", error.message);
    console.log(error.stack);
    throw error;
  }
};

// for graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`Received ${signal}, closing Redis connection...`);

  if (redis_client) {
    try {
      await redis_client.quit();
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

export const pushToQueue = async (queueName: string, message: any) => {
  const client = await getRedisClient();
  try {
    await client.rpush(queueName, JSON.stringify(message));
    console.log(`Message pushed to queue: ${queueName}`);
  } catch (error: any) {
    console.error("Error pushing to queue:", error.message);
    throw error;
  }
};
