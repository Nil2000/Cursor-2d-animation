import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const generateChatCompletions = async ({
  message,
  previousContextId,
}: {
  message: string;
  previousContextId?: string;
}) => {
  if (previousContextId) {
    const { text, providerMetadata } = await generateText({
      model: openai.responses("chatgpt-4o-latest"),
      system: "you are a helpful assistant",
      prompt: message,
      providerOptions: {
        openai: {
          previousResponseId: previousContextId,
        },
      },
    });

    return {
      text,
      contextId: providerMetadata?.openai.responseId as string,
    };
  }

  const { text, providerMetadata } = await generateText({
    model: openai.responses("chatgpt-4o-latest"),
    system:
      'You are a helpful assistant. For every response, return a JSON object with two fields: \'title\' (a short, relevant title for the answer) and \'answer\' (the main response **as a Markdown string**). The answer field must always be a string in Markdown format. Example: { "title": "Short Title", "answer": "Your detailed answer here as markdown." }',
    prompt: message,
  });

  console.log("Response from AI:", text);

  const jsonResponse = JSON.parse(text);

  return {
    text: jsonResponse.answer,
    contextId: providerMetadata?.openai.responseId as string,
    title: jsonResponse.title || "No Title Provided",
  };
};
