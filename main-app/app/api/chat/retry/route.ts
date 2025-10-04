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
import { chat, chat_video, user, creditTransaction } from "@/lib/schema";
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

  // Check user credits and premium status
  const userData = await db
    .select({
      credits: user.credits,
      isPremium: user.isPremium,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!userData || userData.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { credits, isPremium } = userData[0];

  // Validate credits: user must be premium or have credits > 0
  if (!isPremium && credits <= 0) {
    return NextResponse.json(
      {
        error:
          "Insufficient credits. Please purchase more credits to continue.",
      },
      { status: 403 }
    );
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
        let videoQualityMap: Array<{ id: string; quality: string }> = [];

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
            }));

            // Create pending credit transaction for non-premium users
            if (!isPremium) {
              const currentUserCredits = await db
                .select({ credits: user.credits })
                .from(user)
                .where(eq(user.id, session.user.id))
                .limit(1);

              if (currentUserCredits.length > 0) {
                // Calculate total cost for all videos
                const totalCost = newChatVideos.reduce(
                  (sum, video) => sum + video.creditsCost,
                  0
                );
                const newBalance = currentUserCredits[0].credits - totalCost;

                // Create a single pending transaction for this chat retry
                await db.insert(creditTransaction).values({
                  userId: session.user.id,
                  type: "video_generation",
                  amount: -totalCost,
                  balanceAfter: newBalance,
                  description: `Video generation retry for chat ${responseChatId} (${newChatVideos.length} videos)`,
                  chatId: responseChatId,
                  createdAt: new Date(),
                  transactionalStatus: "pending",
                });

                console.log(
                  `Created pending credit transaction for retry (${totalCost} credits)`
                );
              }
            }

            // Add to queue for processing - send all video IDs with quality info
            await sendToQueue(codeBlock, videoQualityMap, responseChatId);
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
    console.error("Error retrying chat completions", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
