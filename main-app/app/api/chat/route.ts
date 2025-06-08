import {
  addChatToSpace,
  createChatSpace,
  setTitleToChatSpace,
} from "@/lib/chat-utls/spaceActions";
import { generateChatCompletions } from "@/lib/chat-utls/getChatCompletions";
import { streamTextForChat } from "@/lib/chat-utls/streamText";
import { NextRequest, NextResponse } from "next/server";
import { getPythonBlockCodeFromMessage } from "@/lib/chat-utls/getPythonBlockCode";
import { sendToQueue } from "@/lib/queue-utils/sendToQueue";
import { db } from "@/lib/db";
import { chat_video } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const { chatId, message, contextId } = await req.json();

  if (!chatId || !message) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const newChatSpace = await createChatSpace(chatId);

    await addChatToSpace(newChatSpace[0].id, "user", message);

    const textResponse = await generateChatCompletions({
      message,
      previousContextId: undefined,
    });

    if (!textResponse || !textResponse.text) {
      return NextResponse.json(
        { error: "Failed to generate response" },
        { status: 500 }
      );
    }

    console.log("Text response from chat completions:", textResponse);

    const assistantChat = await addChatToSpace(
      newChatSpace[0].id,
      "assistant",
      textResponse.text,
      textResponse.contextId
    );

    const codeBlock = await getPythonBlockCodeFromMessage(textResponse.text);
    if (!codeBlock) {
      console.log("No Python code block found in the response.");
    } else {
      // Add to chat video with status pending
      const newChatVideo = await db
        .insert(chat_video)
        .values({
          chatId: assistantChat.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "pending",
          url: null,
        })
        .returning();
      // Add to queue for processing
      await sendToQueue(message, newChatVideo[0].id);
    }
    await setTitleToChatSpace(newChatSpace[0].id, textResponse.title);

    return NextResponse.json(
      {
        response: textResponse.text,
        contextId: textResponse.contextId,
        videoGenerationStatus: !codeBlock ? "no_code" : "pending",
        title: textResponse.title,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating chat completions", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
