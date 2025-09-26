import {
  addChatToSpace,
  setTitleToChatSpace,
} from "@/lib/chat-utils/spaceActions";
import { streamTextForChat } from "@/lib/chat-utils/streamText";
import { NextRequest, NextResponse } from "next/server";
import { getPythonBlockCodeFromMessage } from "@/lib/chat-utils/getPythonBlockCode";
import { getTitleFromMessage } from "@/lib/chat-utils/getTitleFromMessage";
import { sendToQueue } from "@/lib/queue-utils/sendToQueue";
import { db } from "@/lib/db";
import { chat, chat_video } from "@/lib/schema";
import { Messages, Role } from "@/lib/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { chatId } = await req.json();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!chatId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    // Get all existing chats for this space
    const existingChats = await db
      .select()
      .from(chat)
      .where(eq(chat.chatSpaceId, chatId))
      .orderBy(chat.createdAt);

    if (existingChats.length === 0) {
      return NextResponse.json(
        { error: "No chat history found" },
        { status: 404 }
      );
    }

    // Check if the last message is an assistant message and delete it
    const lastMessage = existingChats[existingChats.length - 1];

    if (lastMessage.type !== "assistant") {
      return NextResponse.json(
        { error: "Last message is not from assistant" },
        { status: 400 }
      );
    }

    // Delete the last assistant message and its associated chat_videos
    await db.delete(chat_video).where(eq(chat_video.chatId, lastMessage.id));

    await db.delete(chat).where(eq(chat.id, lastMessage.id));

    // Get the remaining chats after deletion for context
    const remainingChats = await db
      .select()
      .from(chat)
      .where(eq(chat.chatSpaceId, chatId))
      .orderBy(chat.createdAt);

    // Prepare messages for streaming (remaining chats)
    const messages: Messages = remainingChats.map((chat) => ({
      content: chat.body,
      role: chat.type === "user" ? Role.User : Role.Assistant,
    }));

    // Check if this is the first conversation after deletion
    const isFirstConversation = remainingChats.length === 1;

    // Create a readable stream for streaming response
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let newChatVideoId: string | null = null;

        try {
          await streamTextForChat(messages, (chunk: string) => {
            fullResponse += chunk;
            // Send chunk to client in SSE format
            const sseData = `data: ${JSON.stringify({ content: chunk })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          });

          // After streaming is complete, add to database
          const responseChatId = await addChatToSpace(
            chatId,
            "assistant",
            fullResponse,
            undefined // No contextId for now since we're using streaming
          );

          // Get Python code block from response
          const codeBlock = await getPythonBlockCodeFromMessage(fullResponse);
          if (!codeBlock) {
            console.log("No Python code block found in the response.");
          } else {
            // Add to chat video with status pending
            const newChatVideo = await db
              .insert(chat_video)
              .values({
                chatId: responseChatId,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: "pending",
                url: null,
              })
              .returning();
            console.log("Codeblock", codeBlock);
            newChatVideoId = newChatVideo[0].id;
            // Add to queue for processing
            await sendToQueue(codeBlock, newChatVideoId);
          }

          // Extract title from the AI response if this is the first conversation
          if (isFirstConversation) {
            const extractedTitle = getTitleFromMessage(fullResponse);
            await setTitleToChatSpace(chatId, extractedTitle);
          }

          // Send metadata at the end
          const metadataData = `data: ${JSON.stringify({
            type: "metadata",
            chatId: chatId,
            newChatVideoId: newChatVideoId,
          })}\n\n`;
          controller.enqueue(encoder.encode(metadataData));

          // Send completion signal
          const doneData = `data: [DONE]\n\n`;
          controller.enqueue(encoder.encode(doneData));
        } catch (error) {
          console.error("Error during streaming:", error);
          controller.enqueue(
            encoder.encode("Error: Failed to get AI response")
          );
        } finally {
          // Close the stream
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error retrying chat completions", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
