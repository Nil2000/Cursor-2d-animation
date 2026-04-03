import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "../db";
import { chat, chat_video, creditTransaction, user } from "../schema";
import { ClientMessageVideoType, Messages } from "../types";
import { sendToQueue } from "../queue-utils/sendToQueue";
import { getPythonBlockCodeFromMessage } from "./getPythonBlockCode";
import { setTitleToChatSpace } from "./spaceActions";
import { streamTextForChat } from "./streamText";
import { getTitleFromMessage } from "./getTitleFromMessage";

export const VIDEO_QUALITIES = ["high", "medium", "low"] as const;
export const TOTAL_VIDEO_COST = VIDEO_QUALITIES.length;
export const INSUFFICIENT_CREDITS_MESSAGE =
  "Insufficient credits. Please purchase more credits to continue.";

export class InsufficientCreditsError extends Error {
  constructor() {
    super(INSUFFICIENT_CREDITS_MESSAGE);
    this.name = "InsufficientCreditsError";
  }
}

type ChatTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type ChatGenerationOptions = {
  chatId: string;
  messages: Messages;
  isPremium: boolean;
  sessionUserId: string;
  isFirstConversation: boolean;
  retryMode?: boolean;
  beforeAssistantPersist?: (tx: ChatTransaction) => Promise<void>;
};

export async function createChatGenerationStreamResponse({
  chatId,
  messages,
  isPremium,
  sessionUserId,
  isFirstConversation,
  retryMode = false,
  beforeAssistantPersist,
}: ChatGenerationOptions): Promise<Response> {
  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let videoQualityMap: ClientMessageVideoType[] = [];
      let responseChatId = chatId;

      try {
        await streamTextForChat(messages, (chunk: string) => {
          fullResponse += chunk;
          const sseData = `data: ${JSON.stringify({ content: chunk })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
        });

        const codeBlock = await getPythonBlockCodeFromMessage(fullResponse);
        const persistedResult = await db.transaction(async (tx) => {
          if (beforeAssistantPersist) {
            await beforeAssistantPersist(tx);
          }

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
                    eq(user.id, sessionUserId),
                    gte(user.credits, TOTAL_VIDEO_COST),
                  ),
                )
                .returning({ credits: user.credits });

              if (updatedCredits.length === 0) {
                throw new InsufficientCreditsError();
              }

              await tx.insert(creditTransaction).values({
                userId: sessionUserId,
                type: "video_generation",
                amount: -TOTAL_VIDEO_COST,
                balanceAfter: updatedCredits[0].credits,
                description: `Video generation${retryMode ? " retry" : ""} for chat ${assistantChatId} (${VIDEO_QUALITIES.length} videos)`,
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
                })),
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
          videoQualityMap = persistedResult.newChatVideos.map((video) => ({
            id: video.id,
            quality: video.quality,
            url: "",
            status: "pending",
          }));

          await sendToQueue(codeBlock, videoQualityMap, responseChatId);
        }

        if (isFirstConversation) {
          const extractedTitle = getTitleFromMessage(fullResponse);
          await setTitleToChatSpace(chatId, extractedTitle);
        }

        const metadataData = `data: ${JSON.stringify({
          type: "metadata",
          chatId,
          videos: videoQualityMap,
        })}\n\n`;
        controller.enqueue(encoder.encode(metadataData));

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      } catch (error) {
        if (error instanceof InsufficientCreditsError) {
          console.warn(
            `Insufficient credits during ${retryMode ? "retry" : "chat"} generation.`,
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: INSUFFICIENT_CREDITS_MESSAGE,
              })}\n\n`,
            ),
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          return;
        }

        console.error("Error during streaming:", error);
        controller.enqueue(encoder.encode("Error: Failed to get AI response"));
      } finally {
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
}
