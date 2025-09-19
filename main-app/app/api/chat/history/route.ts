import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chat_space } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get("limit");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  const userId = session.user.id;

  try {
    let chatHistory;
    if (limit) {
      chatHistory = await db
        .select({
          id: chat_space.id,
          title: chat_space.title,
        })
        .from(chat_space)
        .where(eq(chat_space.userId, userId))
        .orderBy(desc(chat_space.createdAt))
        .limit(parseInt(limit, 10));
    } else {
      chatHistory = await db
        .select({
          id: chat_space.id,
          title: chat_space.title,
        })
        .from(chat_space)
        .where(eq(chat_space.userId, userId))
        .orderBy(desc(chat_space.createdAt));
    }

    return NextResponse.json(chatHistory);
  } catch (error) {
    console.log("Error fetching chat history:", error);
    return new NextResponse("Internal Server Error", {
      status: 500,
    });
  }
}
