import { Client } from "@upstash/qstash";

const getQStashClient = () => {
  if (!process.env.QSTASH_TOKEN) {
    throw new Error("QSTASH_TOKEN must be set");
  }

  return new Client({
    token: process.env.QSTASH_TOKEN,
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
  const client = getQStashClient();

  console.log("Connected to QStash");
  console.log(`Started consuming messages from queue: ${queueName}`);

  // QStash uses HTTP endpoints for message consumption
  // This requires setting up a receiver endpoint
  // For now, we'll implement a polling approach using QStash's message API
  while (true) {
    try {
      // Get messages from the topic/queue
      const messages = await client.messages.get({
        topic: queueName,
      });

      if (messages.length > 0) {
        for (const message of messages) {
          console.log({
            queue: queueName,
            messageId: message.messageId,
            message: message.body,
          });

          if (message.body) {
            await onMessage(message.body).catch((error) => {
              console.error("Error processing message:", error.message);
              console.log(error.stack);
            });
          }

          // Acknowledge the message to remove it from the queue
          await client.messages.delete(message.messageId);
        }
      } else {
        // No messages, wait before polling again
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error: any) {
      console.error("Error in queue consumption:", error.message);
      console.log(error.stack);
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};
