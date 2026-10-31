import {
  createChatGenerationResponse,
  INSUFFICIENT_CREDITS_MESSAGE,
  loadGenerationAccess,
} from "@/lib/chat-utils/chatGeneration";
import { claimGeneration } from "@/lib/chat-utils/spaceActions";
import { db } from "@/lib/db";
import { chat } from "@/lib/schema";
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

  const access = await loadGenerationAccess(session.user.id);
  if (!access) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!access.allowed) {
    return NextResponse.json(
      { error: INSUFFICIENT_CREDITS_MESSAGE },
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

    const claimed = await claimGeneration(chatId);
    if (!claimed) {
      return NextResponse.json(
        { error: "Generation already in progress", code: "in_progress" },
        { status: 409 },
      );
    }

    return createChatGenerationResponse({
      chatId,
      messages,
      isPremium: access.isPremium,
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
