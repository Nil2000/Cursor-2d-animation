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
import { chat, chat_space, chat_video, user, creditTransaction } from "@/lib/schema";
import { Messages, Role } from "@/lib/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { and, eq, gte, sql } from "drizzle-orm";

const VIDEO_QUALITIES = ["high", "medium", "low"] as const;
const TOTAL_VIDEO_COST = VIDEO_QUALITIES.length;
const INSUFFICIENT_CREDITS_MESSAGE =
  "Insufficient credits. Please purchase more credits to continue.";

class InsufficientCreditsError extends Error {
  constructor() {
    super(INSUFFICIENT_CREDITS_MESSAGE);
    this.name = "InsufficientCreditsError";
  }
}

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

  // Validate credits: user must be premium or have enough credits for video generation
  if (!isPremium && credits < TOTAL_VIDEO_COST) {
    return NextResponse.json(
      {
        error: INSUFFICIENT_CREDITS_MESSAGE,
      },
      { status: 403 }
    );
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
        let responseChatId = chatId;

        try {
          await streamTextForChat(messages, (chunk: string) => {
            fullResponse += chunk;
            // Send chunk to client in SSE format
            const sseData = `data: ${JSON.stringify({ content: chunk })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          });

          // Get Python code block from response
          const codeBlock = await getPythonBlockCodeFromMessage(fullResponse);
          const persistedResult = await db.transaction(async (tx) => {
            const assistantMessage = await tx
              .insert(chat)
              .values({
                createdAt: new Date(),
                updatedAt: new Date(),
                chatSpaceId: chatId,
                body: fullResponse,
                type: "assistant",
              })
              .returning({ id: chat.id });

            const assistantChatId = assistantMessage[0]?.id;
            if (!assistantChatId) {
              throw new Error("Failed to create assistant chat message");
            }

            let newChatVideos: Array<{
              id: string;
              quality: string;
              url: string | null;
              status: string | null;
            }> = [];

            if (codeBlock) {
              if (!isPremium) {
                const updatedCredits = await tx
                  .update(user)
                  .set({
                    credits: sql<number>`${user.credits} - ${TOTAL_VIDEO_COST}`,
                  })
                  .where(
                    and(
                      eq(user.id, session.user.id),
                      gte(user.credits, TOTAL_VIDEO_COST)
                    )
                  )
                  .returning({ credits: user.credits });

                if (updatedCredits.length === 0) {
                  throw new InsufficientCreditsError();
                }

                await tx.insert(creditTransaction).values({
                  userId: session.user.id,
                  type: "video_generation",
                  amount: -TOTAL_VIDEO_COST,
                  balanceAfter: updatedCredits[0].credits,
                  description: `Video generation for chat ${assistantChatId} (${VIDEO_QUALITIES.length} videos)`,
                  chatId: assistantChatId,
                  createdAt: new Date(),
                  transactionalStatus: "pending",
                });
              }

              const now = new Date();
              newChatVideos = await tx
                .insert(chat_video)
                .values(
                  VIDEO_QUALITIES.map((quality) => ({
                    chatId: assistantChatId,
                    createdAt: now,
                    updatedAt: now,
                    status: "pending" as const,
                    quality,
                    url: null,
                  }))
                )
                .returning();
            }

            return {
              responseChatId: assistantChatId,
              newChatVideos,
            };
          });

          responseChatId = persistedResult.responseChatId;
          if (codeBlock) {
            console.log("Codeblock", codeBlock);
            videoQualityMap = persistedResult.newChatVideos.map((video) => ({
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
          if (error instanceof InsufficientCreditsError) {
            console.warn("Insufficient credits during chat generation.");
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  error: INSUFFICIENT_CREDITS_MESSAGE,
                })}\n\n`
              )
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            return;
          }
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
