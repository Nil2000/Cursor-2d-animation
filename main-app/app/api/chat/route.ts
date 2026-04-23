import { addChatToSpace } from "@/lib/chat-utils/spaceActions";
import {
  createChatGenerationResponse,
  TOTAL_VIDEO_COST,
  INSUFFICIENT_CREDITS_MESSAGE,
} from "@/lib/chat-utils/chatGeneration";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chat, chat_space, user } from "@/lib/schema";
import { Messages, Role } from "@/lib/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { CHAT_SPACE_CREATED_EVENT } from "@/lib/chat-utils/chatNotifications";
import { publishChatNotification } from "@/lib/chat-utils/publishChatNotification";

export async function POST(req: NextRequest) {
  const { chatId, message } = await req.json();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!chatId || !message) {
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
    // Check if this is the first conversation (no existing chats)
    const existingChats = await db
      .select()
      .from(chat)
      .where(eq(chat.chatSpaceId, chatId));

    const isFirstConversation = existingChats.length === 0;

    if (isFirstConversation) {
      // Create new chat space and first chat in transaction
      await db.transaction(async (tx) => {
        await tx.insert(chat_space).values({
          id: chatId,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: session.user.id,
        });

        await tx.insert(chat).values({
          createdAt: new Date(),
          updatedAt: new Date(),
          chatSpaceId: chatId,
          body: message,
          type: "user",
        });
      });

      await publishChatNotification({
        userId: session.user.id,
        event: CHAT_SPACE_CREATED_EVENT,
        payload: { chatSpaceId: chatId },
      });
    } else {
      // Just add the new chat to existing space
      await addChatToSpace(chatId, "user", message);
    }

    const messages: Messages = [
      ...existingChats.map((chat) => ({
        content: chat.body,
        role: chat.type === "user" ? Role.User : Role.Assistant,
      })),
      {
        content: message,
        role: Role.User,
      },
    ];

    // console.log(messages);

    return createChatGenerationResponse({
      chatId,
      messages,
      isPremium,
      sessionUserId: session.user.id,
      isFirstConversation,
    });
  } catch (error) {
    console.error("Error generating chat completions", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
