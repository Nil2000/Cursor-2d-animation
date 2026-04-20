import { and, eq, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "../db";
import { chat, chat_video, creditTransaction, user } from "../schema";
import {
  ChatGenerationApiSuccess,
  ClientMessageVideoType,
  Messages,
} from "../types";
import { sendToQueue } from "../queue-utils/sendToQueue";
import { getPythonBlockCodeFromMessage } from "./getPythonBlockCode";
import { setTitleToChatSpace } from "./spaceActions";
import { completeTextForChat } from "./completeTextForChat";
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

export async function createChatGenerationResponse({
  chatId,
  messages,
  isPremium,
  sessionUserId,
  isFirstConversation,
  retryMode = false,
  beforeAssistantPersist,
}: ChatGenerationOptions): Promise<NextResponse> {
  try {
    const fullResponse = await completeTextForChat(messages);
    const codeBlock = await getPythonBlockCodeFromMessage(fullResponse);
    let videoQualityMap: ClientMessageVideoType[] = [];

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

    if (codeBlock) {
      videoQualityMap = persistedResult.newChatVideos.map((video) => ({
        id: video.id,
        quality: video.quality,
        url: "",
        status: "pending",
      }));

      await sendToQueue(codeBlock, videoQualityMap, persistedResult.responseChatId);
    }

    if (isFirstConversation) {
      const extractedTitle = getTitleFromMessage(fullResponse);
      await setTitleToChatSpace(chatId, extractedTitle);
    }

    const payload: ChatGenerationApiSuccess = {
      chatId,
      body: fullResponse,
      videos: videoQualityMap,
    };

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      console.warn(
        `Insufficient credits during ${retryMode ? "retry" : "chat"} generation.`,
      );
      return NextResponse.json(
        { error: INSUFFICIENT_CREDITS_MESSAGE },
        { status: 403 },
      );
    }

    console.error("Error during chat generation:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 },
    );
  }
}
