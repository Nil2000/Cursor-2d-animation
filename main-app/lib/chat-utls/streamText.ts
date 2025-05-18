import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

type Props = {
  message: string;
  previousContextId?: string;
};

export function streamTextForChat({ message, previousContextId }: Props) {
  if (!previousContextId) {
    const { textStream, providerMetadata } = streamText({
      model: openai("chatgpt-4o-latest"),
      prompt: message,
    });
    return {
      textStream,
      providerMetadata,
    };
  }

  const { textStream, providerMetadata } = streamText({
    model: openai("chatgpt-4o-latest"),
    prompt: message,
    providerOptions: {
      openai: {
        previousContextId,
      },
    },
  });

  return {
    textStream,
    providerMetadata,
  };
}
