import { processMessage } from "./processMessage";
import { startConsumingMessages } from "./queue";

startConsumingMessages({
  queueName: process.env.QSTASH_TOPIC_NAME || "manim-queue",
  onMessage: async (message) => {
    processMessage(message);
  },
}).catch((error) => {
  console.error("Error starting message consumer:", error.message);
  console.log(error.stack);
  process.exit(1);
});
