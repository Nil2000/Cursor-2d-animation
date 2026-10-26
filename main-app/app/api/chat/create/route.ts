import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { CHAT_SPACE_CREATED_EVENT } from "@/lib/chat-utils/chatNotifications";
import {
  INSUFFICIENT_CREDITS_MESSAGE,
  loadGenerationAccess,
} from "@/lib/chat-utils/chatGeneration";
import { normalizeChatMessage } from "@/lib/chat-utils/generationGuard";
import { publishChatNotification } from "@/lib/chat-utils/publishChatNotification";
import { createChatSpaceWithMessage } from "@/lib/chat-utils/spaceActions";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const message =
    body && typeof body === "object" && "message" in body
      ? normalizeChatMessage((body as { message: unknown }).message)
      : null;

  if (!message) {
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
    const chatSpace = await createChatSpaceWithMessage(
      session.user.id,
      message,
    );

    await publishChatNotification({
      userId: session.user.id,
      event: CHAT_SPACE_CREATED_EVENT,
      payload: { chatSpaceId: chatSpace.id },
    });

    return NextResponse.json({ chatId: chatSpace.id });
  } catch (error) {
    console.error("Error creating chat space", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
