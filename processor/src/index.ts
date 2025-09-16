import { processMessage } from "./processMessage";
import { startConsumingMessages } from "./queue";

startConsumingMessages({
  topic: process.env.KAFKA_TOPIC || "default-topic",
  onMessage: async (message) => {
    processMessage(message);
  },
}).catch((error) => {
  console.error("Error starting message consumer:", error.message);
  console.log(error.stack);
  process.exit(1);
});
