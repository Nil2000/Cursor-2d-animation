import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { addChatToSpace } from "@/lib/chat-utils/spaceActions";
import {
  createChatGenerationResponse,
  TOTAL_VIDEO_COST,
  INSUFFICIENT_CREDITS_MESSAGE,
} from "@/lib/chat-utils/chatGeneration";
import { chat, user } from "@/lib/schema";
import { Messages, Role } from "@/lib/types";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatSpaceId: string }> },
) {
  const { chatSpaceId } = await params;

  if (!chatSpaceId) {
    return new Response("Invalid request", { status: 400 });
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  // Check if the chat space belongs to the user
  try {
    const chatSpace = await db.query.chat_space.findFirst({
      where: (chatSpace, { eq }) => eq(chatSpace.id, chatSpaceId),
    });

    if (!chatSpace || chatSpace.userId !== session.user.id) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const messages = await db.query.chat.findMany({
      where: (chat, { eq }) => eq(chat.chatSpaceId, chatSpaceId),
      with: {
        chat_videos: true,
      },
      orderBy: (chat, { asc }) => asc(chat.createdAt),
    });

    return NextResponse.json(
      {
        messages: messages,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching messages", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatSpaceId: string }> },
) {
  const { chatSpaceId } = await params;
  const { message } = await req.json();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!chatSpaceId || !message) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const chatSpace = await db.query.chat_space.findFirst({
    where: (space, { eq }) => eq(space.id, chatSpaceId),
  });

  if (!chatSpace) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  if (chatSpace.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  if (!isPremium && credits < TOTAL_VIDEO_COST) {
    return NextResponse.json(
      {
        error: INSUFFICIENT_CREDITS_MESSAGE,
      },
      { status: 403 },
    );
  }

  try {
    const existingChats = await db
      .select()
      .from(chat)
      .where(eq(chat.chatSpaceId, chatSpaceId));

    const isFirstConversation = existingChats.length === 0;

    await addChatToSpace(chatSpaceId, "user", message);

    const messages: Messages = [
      ...existingChats.map((chatRow) => ({
        content: chatRow.body,
        role: chatRow.type === "user" ? Role.User : Role.Assistant,
      })),
      {
        content: message,
        role: Role.User,
      },
    ];

    return createChatGenerationResponse({
      chatId: chatSpaceId,
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
