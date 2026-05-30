import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { CHAT_SPACE_CREATED_EVENT } from "@/lib/chat-utils/chatNotifications";
import { publishChatNotification } from "@/lib/chat-utils/publishChatNotification";
import { createEmptyChatSpace } from "@/lib/chat-utils/spaceActions";

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chatSpace = await createEmptyChatSpace(session.user.id);

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
