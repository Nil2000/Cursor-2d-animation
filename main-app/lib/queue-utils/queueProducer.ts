/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from "ioredis";

let redis_client: Redis | null = null;

export const getRedisClient = async () => {
  if (redis_client) {
    return redis_client;
  }

  try {
    redis_client = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    });

    // Test connection
    await redis_client.ping();
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
    await client.lpush(queueName, JSON.stringify(message));
    console.log(`Message pushed to queue: ${queueName}`);
  } catch (error: any) {
    console.error("Error pushing to queue:", error.message);
    throw error;
  }
};
