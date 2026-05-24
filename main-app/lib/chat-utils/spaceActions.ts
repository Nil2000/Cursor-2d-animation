import { eq } from "drizzle-orm";
import { db } from "../db";
import { chat, chat_space } from "../schema";

export const createEmptyChatSpace = async (userId: string) => {
  try {
    const [chatSpace] = await db
      .insert(chat_space)
      .values({
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
      })
      .returning({ id: chat_space.id });

    if (!chatSpace) {
      throw new Error("Failed to create chat space");
    }

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
