import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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
    let chatHistory = [];
    if (limit) {
      chatHistory = await db.query.chat_space.findMany({
        where: (chat_space, { eq }) => eq(chat_space.userId, userId),
        columns: {
          id: true,
          title: true,
        },
        orderBy: (chat_space, { desc }) => desc(chat_space.createdAt),
        limit: parseInt(limit, 10),
      });
    }
    chatHistory = await db.query.chat_space.findMany({
      where: (chat_space, { eq }) => eq(chat_space.userId, userId),
      columns: {
        id: true,
        title: true,
      },
      orderBy: (chat_space, { desc }) => desc(chat_space.createdAt),
    });

    return NextResponse.json(chatHistory);
  } catch (error) {
    console.log("Error fetching chat history:", error);
    return new NextResponse("Internal Server Error", {
      status: 500,
    });
  }
}
