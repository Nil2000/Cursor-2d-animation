"use server";

import { db } from "@/lib/db";
import { chat_space } from "@/lib/schema";
import { and, eq } from "drizzle-orm";

export async function fetchChatSpaceForUser(
  chatSpaceId: string,
  userId: string,
) {
  try {
    const [chatSpace] = await db
      .select()
      .from(chat_space)
      .where(and(eq(chat_space.id, chatSpaceId), eq(chat_space.userId, userId)));

    return chatSpace ?? null;
  } catch (error) {
    console.error("Error fetching chat space", error);
    return null;
  }
}
