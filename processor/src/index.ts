import { startConsumingMessages } from "./queue";

startConsumingMessages({
  topic: process.env.KAFKA_TOPIC || "default-topic",
  onMessage: async (message) => {
    console.log("Received message:", message);
    // Here you can add your message processing logic
  },
}).catch((error) => {
  console.error("Error starting message consumer:", error.message);
  console.log(error.stack);
  process.exit(1);
});
