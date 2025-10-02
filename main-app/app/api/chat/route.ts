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
import { chat, chat_space, chat_video } from "@/lib/schema";
import { Messages, Role } from "@/lib/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

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
    // Check if this is the first conversation (no existing chats)
    const existingChats = await db
      .select()
      .from(chat)
      .where(eq(chat.chatSpaceId, chatId));

    const isFirstConversation = existingChats.length === 0;

    if (isFirstConversation) {
      // Create new chat space and first chat in transaction
      await db.transaction(async (tx) => {
        await tx.insert(chat_space).values({
          id: chatId,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: session.user.id,
        });

        await tx.insert(chat).values({
          createdAt: new Date(),
          updatedAt: new Date(),
          chatSpaceId: chatId,
          body: message,
          type: "user",
        });
      });
    } else {
      // Just add the new chat to existing space
      await addChatToSpace(chatId, "user", message);
    }

    // Prepare messages for streaming (existing chats + current message)
    const messages: Messages = [
      ...existingChats.map((chat) => ({
        content: chat.body,
        role: chat.type === "user" ? Role.User : Role.Assistant,
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
        const encoder = new TextEncoder();
        let videoQualityMap: Array<{
          id: string;
          quality: string;
          url: string;
          status: string;
        }> = [];

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
            // Create 3 videos with different qualities
            const qualities = ["high", "medium", "low"] as const;
            const now = new Date();

            const newChatVideos = await db
              .insert(chat_video)
              .values(
                qualities.map((quality) => ({
                  chatId: responseChatId,
                  createdAt: now,
                  updatedAt: now,
                  status: "pending" as const,
                  quality,
                  url: null,
                }))
              )
              .returning();

            console.log("Codeblock", codeBlock);
            videoQualityMap = newChatVideos.map((video) => ({
              id: video.id,
              quality: video.quality,
              url: "",
              status: "pending",
            }));

            // Add to queue for processing - send all video IDs with quality info
            await sendToQueue(codeBlock, videoQualityMap, responseChatId);
          }

          // Extract title from the AI response
          if (isFirstConversation) {
            const extractedTitle = getTitleFromMessage(fullResponse);
            await setTitleToChatSpace(chatId, extractedTitle);
          }

          // Send metadata at the end
          const metadataData = `data: ${JSON.stringify({
            type: "metadata",
            chatId: chatId,
            videos: videoQualityMap,
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
    console.error("Error generating chat completions", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
