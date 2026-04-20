import {
  createChatGenerationResponse,
  TOTAL_VIDEO_COST,
  INSUFFICIENT_CREDITS_MESSAGE,
} from "@/lib/chat-utils/chatGeneration";
import { db } from "@/lib/db";
import { chat, user } from "@/lib/schema";
import { Messages, Role } from "@/lib/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
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

  const { credits, isPremium: rawIsPremium } = userData[0];
  const isPremium = Boolean(rawIsPremium);

  // Validate credits: user must be premium or have enough credits for video generation
  if (!isPremium && credits < TOTAL_VIDEO_COST) {
    return NextResponse.json(
      {
        error: INSUFFICIENT_CREDITS_MESSAGE,
      },
      { status: 403 },
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
        { status: 404 },
      );
    }

    // Check if the last message is an assistant message and preserve it for retry replacement
    const lastMessage = existingChats[existingChats.length - 1];

    if (lastMessage.type !== "assistant") {
      return NextResponse.json(
        { error: "Last message is not from assistant" },
        { status: 400 },
      );
    }

    // Use the remaining chats for context while keeping the last assistant message intact until retry succeeds
    const remainingChats = existingChats.slice(0, -1);

    const messages: Messages = remainingChats.map((chat) => ({
      content: chat.body,
      role: chat.type === "user" ? Role.User : Role.Assistant,
    }));

    // Check if this is the first conversation after deletion
    const isFirstConversation = remainingChats.length === 1;

    return createChatGenerationResponse({
      chatId,
      messages,
      isPremium,
      sessionUserId: session.user.id,
      isFirstConversation,
      retryMode: true,
      beforeAssistantPersist: async (tx) => {
        await tx.delete(chat).where(eq(chat.id, lastMessage.id));
      },
    });
  } catch (error) {
    console.error("Error retrying chat completions", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
