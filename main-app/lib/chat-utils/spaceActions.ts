import { headers } from "next/headers";
import { auth } from "../auth";
import { db } from "../db";
import { chat, chat_space } from "../schema";
import { eq } from "drizzle-orm";

export const createChatSpace = async (chatId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    throw new Error("User not authenticated");
  }

  try {
    const chatSpace = await db
      .insert(chat_space)
      .values({
        id: chatId,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: session.user.id,
      })
      .returning();

    return chatSpace;
  } catch (error) {
    console.error("Error creating chat space", error);
    throw new Error("Internal server error");
  }
};

export const addChatToSpace = async (
  chatSpaceId: string,
  messageType: "user" | "assistant",
  messageBody: string,
  contextId?: string
) => {
  try {
    const newChat = await db
      .insert(chat)
      .values({
        createdAt: new Date(),
        updatedAt: new Date(),
        chatSpaceId,
        body: messageBody,
        type: messageType,
        contextId: contextId || null,
      })
      .returning();
    return newChat[0];
  } catch (error) {
    console.error("Error adding chat to space", error);
    throw new Error("Internal server error");
  }
};

export const setTitleToChatSpace = async (
  chatSpaceId: string,
  title: string
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
