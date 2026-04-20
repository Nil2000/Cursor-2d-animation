import {
  MODEL,
  OPENROUTER_CHAT_COMPLETION_URL,
  OPENROUTER_API_KEY,
  MANIM_SYSTEM_PRESET,
} from "../constants";
import { Messages } from "../types";

type OpenRouterChatResponse = {
  choices?: Array<{
    message?: { content?: string | null };
  }>;
};

export async function completeTextForChat(messages: Messages): Promise<string> {
  const response = await fetch(OPENROUTER_CHAT_COMPLETION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      preset: MANIM_SYSTEM_PRESET,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "unknown error");
    throw new Error(`Model API returned ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as OpenRouterChatResponse;
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Model API returned no message content");
  }
  return content;
}
