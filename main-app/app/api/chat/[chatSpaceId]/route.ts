import { db } from "@/lib/db";
import { chat_space, chat_video } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatSpaceId: string }> }
) {
  const { chatSpaceId } = await params;

  if (!chatSpaceId) {
    return new Response("Invalid request", { status: 400 });
  }

  try {
    const chatSpace = await db.query.chat_space.findFirst({
      where: eq(chat_space.id, chatSpaceId),
      with: {
        chats: {
          with: {
            chat_video: true,
          },
        },
      },
    });

    if (!chatSpace) {
      return NextResponse.json(
        { error: "Chat space not found" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        spaceInfo: chatSpace,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching chat space", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
