/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@upstash/qstash";

let qstash_client: Client | null = null;

export const getQStashClient = async () => {
  if (qstash_client) {
    return qstash_client;
  }

  try {
    if (!process.env.QSTASH_TOKEN) {
      throw new Error("QSTASH_TOKEN must be set");
    }

    qstash_client = new Client({
      token: process.env.QSTASH_TOKEN,
    });

    console.log("Connected to QStash");
    return qstash_client;
  } catch (error: any) {
    console.error("Error creating QStash client:", error.message);
    console.log(error.stack);
    throw error;
  }
};

export const pushToQueue = async (queueName: string, message: any) => {
  const client = await getQStashClient();
  try {
    await client.publishJSON({
      topic: queueName,
      content: message,
    });
    console.log(`Message pushed to queue: ${queueName}`);
  } catch (error: any) {
    console.error("Error pushing to queue:", error.message);
    throw error;
  }
};
