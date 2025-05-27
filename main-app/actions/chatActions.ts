"use server";

import { db } from "@/lib/db";
export async function fetchChatSpaceIfExists(chatSpaceId: string) {
  try {
    const chatSpace = await db.query.chat_space.findFirst({
      where: (chat_space, { eq }) => eq(chat_space.id, chatSpaceId),
    });

    return chatSpace;
  } catch (error) {
    console.error("Error fetching chat space", error);
    return null;
  }
}
