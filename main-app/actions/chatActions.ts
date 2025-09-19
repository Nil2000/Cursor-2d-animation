"use server";

import { db } from "@/lib/db";
import { chat_space } from "@/lib/schema";
import { eq } from "drizzle-orm";
export async function fetchChatSpaceIfExists(chatSpaceId: string) {
  try {
    const chatSpace = await db
      .select()
      .from(chat_space)
      .where(eq(chat_space.id, chatSpaceId));

    return chatSpace[0];
  } catch (error) {
    console.error("Error fetching chat space", error);
    return null;
  }
}
