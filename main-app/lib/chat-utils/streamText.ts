import {
  MODEL,
  OPENROUTER_CHAT_COMPLETION_URL,
  OPENROUTER_API_KEY,
  MAX_TOKENS,
  MANIM_SYSTEM_PRESET,
} from "../constants";
import { Messages } from "../types";

export function streamTextForChat(
  messages: Messages,
  cb: (chunk: string) => void
) {
  return new Promise<void>(async (resolve, reject) => {
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
        stream: true,
      }),
    });

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    try {
      let tokenCount = 0;
      while (true) {
        tokenCount++;
        if (tokenCount > MAX_TOKENS) {
          console.log("max tokens iterations");
          resolve();
          return;
        }
        const { done, value } = await reader.read();
        if (done) break;
        // Append new chunk to buffer
        buffer += decoder.decode(value, { stream: true });
        // Process complete lines from buffer
        while (true) {
          const lineEnd = buffer.indexOf("\n");
          if (lineEnd === -1) break;
          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0].delta.content;
              if (content) {
                cb(content);
              }
            } catch (e) {
              // Ignore invalid JSON
              console.warn("Failed to parse JSON", data, e);
            }
          }
        }
      }
    } finally {
      resolve();
      reader.cancel();
    }
  });
}
