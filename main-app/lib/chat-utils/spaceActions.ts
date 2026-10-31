import { and, eq, isNull, lt, or } from "drizzle-orm";
import { db } from "../db";
import { chat, chat_space } from "../schema";
import { GENERATION_CLAIM_TIMEOUT_MS } from "./generationGuard";

export const createChatSpaceWithMessage = async (
  userId: string,
  message: string,
) => {
  try {
    const now = new Date();

    return await db.transaction(async (tx) => {
      const [chatSpace] = await tx
        .insert(chat_space)
        .values({
          createdAt: now,
          updatedAt: now,
          userId,
        })
        .returning({ id: chat_space.id });

      if (!chatSpace) {
        throw new Error("Failed to create chat space");
      }

      await tx.insert(chat).values({
        createdAt: now,
        updatedAt: now,
        chatSpaceId: chatSpace.id,
        body: message,
        type: "user",
      });

      return chatSpace;
    });
  } catch (error) {
    console.error("Error creating chat space", error);
    throw new Error("Internal server error");
  }
};

export const claimGeneration = async (chatSpaceId: string) => {
  const cutoff = new Date(Date.now() - GENERATION_CLAIM_TIMEOUT_MS);
  const claimed = await db
    .update(chat_space)
    .set({ generatingSince: new Date() })
    .where(
      and(
        eq(chat_space.id, chatSpaceId),
        or(
          isNull(chat_space.generatingSince),
          lt(chat_space.generatingSince, cutoff),
        ),
      ),
    )
    .returning({ id: chat_space.id });

  return claimed.length > 0;
};

export const releaseGeneration = async (chatSpaceId: string) => {
  await db
    .update(chat_space)
    .set({ generatingSince: null })
    .where(eq(chat_space.id, chatSpaceId));
};

export const addChatToSpace = async (
  chatSpaceId: string,
  messageType: "user" | "assistant",
  messageBody: string,
  contextId?: string,
) => {
  try {
    const chatId = await db
      .insert(chat)
      .values({
        createdAt: new Date(),
        updatedAt: new Date(),
        chatSpaceId,
        body: messageBody,
        type: messageType,
        contextId: contextId || null,
      })
      .returning({
        id: chat.id,
      });
    return chatId[0].id;
  } catch (error) {
    console.error("Error adding chat to space", error);
    throw new Error("Internal server error");
  }
};

export const setTitleToChatSpace = async (
  chatSpaceId: string,
  title: string,
) => {
  try {
    const updatedChatSpace = await db
      .update(chat_space)
      .set({ title, updatedAt: new Date() })
      .where(eq(chat_space.id, chatSpaceId))
      .returning();

    return updatedChatSpace[0];
  } catch (error) {
    console.error("Error updating chat space title", error);
    throw new Error("Internal server error");
  }
};
