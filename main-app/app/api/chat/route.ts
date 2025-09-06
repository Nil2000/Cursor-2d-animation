import {
  addChatToSpace,
  createChatSpace,
  setTitleToChatSpace,
} from "@/lib/chat-utils/spaceActions";
import { streamTextForChat } from "@/lib/chat-utils/streamText";
import { NextRequest, NextResponse } from "next/server";
import { getPythonBlockCodeFromMessage } from "@/lib/chat-utils/getPythonBlockCode";
import { getTitleFromMessage } from "@/lib/chat-utils/getTitleFromMessage";
import { sendToQueue } from "@/lib/queue-utils/sendToQueue";
import { db } from "@/lib/db";
import { chat, chat_space, chat_video } from "@/lib/schema";
import { Messages, Role } from "@/lib/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { MANIM_SYSTEM_PROMPT } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const { chatId, message } = await req.json();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!chatId || !message) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const newChatSpace = await createChatSpace(chatId);

    await db.transaction(async (tx) => {
      const newChatSpace = await tx
        .insert(chat_space)
        .values({
          id: chatId,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: session.user.id,
        })
        .returning({ id: chat_space.id });

      await tx.insert(chat).values({
        id: chatId,
        createdAt: new Date(),
        updatedAt: new Date(),
        chatSpaceId: newChatSpace[0].id,
        body: message,
        type: "user",
      });
    });

    const existingChats = await db
      .select()
      .from(chat)
      .where(eq(chat.chatSpaceId, chatId));

    // Check if this is the first conversation (no existing chats)
    const isFirstConversation = existingChats.length === 0;

    // Prepare messages for streaming
    const messages: Messages = [
      ...existingChats.map((chat) => ({
        content: chat.body,
        role: chat.type === "user" ? Role.User : Role.Agent,
      })),
      {
        content: message,
        role: Role.User,
      },
    ];

    // Create a readable stream for streaming response
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamTextForChat(
            messages,
            (chunk: string) => {
              fullResponse += chunk;
              // Send chunk to client
              controller.enqueue(new TextEncoder().encode(chunk));
            },
            isFirstConversation ? MANIM_SYSTEM_PROMPT : undefined
          );

          // Close the stream
          controller.close();

          // After streaming is complete, add to database
          const assistantChat = await addChatToSpace(
            newChatSpace[0].id,
            "assistant",
            fullResponse,
            undefined // No contextId for now since we're using streaming
          );

          // const codeBlock = await getPythonBlockCodeFromMessage(fullResponse);
          // if (!codeBlock) {
          //   console.log("No Python code block found in the response.");
          // } else {
          //   // Add to chat video with status pending
          //   const newChatVideo = await db
          //     .insert(chat_video)
          //     .values({
          //       chatId: assistantChat.id,
          //       createdAt: new Date(),
          //       updatedAt: new Date(),
          //       status: "pending",
          //       url: null,
          //     })
          //     .returning();
          //   // Add to queue for processing
          //   await sendToQueue(codeBlock, newChatVideo[0].id);
          // }
          // Extract title from the AI response
          const extractedTitle = getTitleFromMessage(fullResponse);
          await setTitleToChatSpace(newChatSpace[0].id, extractedTitle);
        } catch (error) {
          console.error("Error during streaming:", error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Transfer-Encoding": "chunked",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error generating chat completions", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
