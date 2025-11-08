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
