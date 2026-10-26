import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  addChatToSpace,
  claimGeneration,
  releaseGeneration,
} from "@/lib/chat-utils/spaceActions";
import {
  createChatGenerationResponse,
  INSUFFICIENT_CREDITS_MESSAGE,
  loadGenerationAccess,
} from "@/lib/chat-utils/chatGeneration";
import {
  canGenerateFromSaved,
  normalizeChatMessage,
} from "@/lib/chat-utils/generationGuard";
import { Messages, Role } from "@/lib/types";
import { chat } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";
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

async function readOptionalMessage(req: NextRequest) {
  const raw = await req.text();
  if (!raw.trim()) {
    return { ok: true as const, message: null };
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return { ok: false as const };
  }

  if (!body || typeof body !== "object" || !("message" in body)) {
    return { ok: true as const, message: null };
  }

  const value = (body as { message: unknown }).message;
  if (value === undefined || value === null) {
    return { ok: true as const, message: null };
  }

  const message = normalizeChatMessage(value);
  if (!message) {
    return { ok: false as const };
  }

  return { ok: true as const, message };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatSpaceId: string }> },
) {
  const { chatSpaceId } = await params;
  const parsed = await readOptionalMessage(req);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!chatSpaceId || !parsed.ok) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { message } = parsed;

  const chatSpace = await db.query.chat_space.findFirst({
    where: (space, { eq }) => eq(space.id, chatSpaceId),
  });

  if (!chatSpace) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  if (chatSpace.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  let held = false;

  try {
    const existingChats = await db
      .select()
      .from(chat)
      .where(eq(chat.chatSpaceId, chatSpaceId))
      .orderBy(asc(chat.createdAt));

    if (!message && !canGenerateFromSaved(existingChats.at(-1))) {
      const last = existingChats.at(-1);
      if (last?.type === "assistant") {
        return NextResponse.json(
          { error: "Response already exists", code: "already_answered" },
          { status: 409 },
        );
      }

      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const claimed = await claimGeneration(chatSpaceId);
    if (!claimed) {
      return NextResponse.json(
        { error: "Generation already in progress", code: "in_progress" },
        { status: 409 },
      );
    }
    held = true;

    const isFirstConversation = !existingChats.some(
      (row) => row.type === "assistant",
    );

    let messages: Messages;
    if (message) {
      await addChatToSpace(chatSpaceId, "user", message);
      messages = [
        ...existingChats.map((chatRow) => ({
          content: chatRow.body,
          role: chatRow.type === "user" ? Role.User : Role.Assistant,
        })),
        {
          content: message,
          role: Role.User,
        },
      ];
    } else {
      messages = existingChats.map((chatRow) => ({
        content: chatRow.body,
        role: chatRow.type === "user" ? Role.User : Role.Assistant,
      }));
    }

    held = false;
    return await createChatGenerationResponse({
      chatId: chatSpaceId,
      messages,
      isPremium: access.isPremium,
      sessionUserId: session.user.id,
      isFirstConversation,
    });
  } catch (error) {
    console.error("Error generating chat completions", error);
    if (held) {
      await releaseGeneration(chatSpaceId).catch((releaseError) => {
        console.error("Error releasing generation claim", releaseError);
      });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
