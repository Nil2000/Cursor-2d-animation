import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const generateChatCompletions = async ({
  message,
  previousContextId,
}: {
  message: string;
  previousContextId?: string;
}) => {
  const { text, providerMetadata } = await generateText({
    model: openai.responses("chatgpt-4o-latest"),
    system: "you are a helpful assistant",
    prompt: message,
  });

  return {
    text,
    contextId: providerMetadata?.openai.responseId as string,
  };
};
