import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chat_video } from "@/lib/schema";

export async function POST(req: NextRequest) {
  // Verify authentication
  const secretKey = req.headers.get("x-secret-key");
  if (!secretKey || secretKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    chatId,
    videoUrls,
  }: {
    chatId: string;
    videoUrls: Array<{
      id: string;
      url: string;
      status: "completed" | "failed";
    }>;
  } = body;

  if (!chatId || !videoUrls || videoUrls.length === 0) {
    return NextResponse.json(
      { error: "chatId and videoUrls are required" },
      { status: 400 }
    );
  }

  try {
    await db.transaction(async (tx) => {
      for (const videoUrl of videoUrls) {
        await tx
          .update(chat_video)
          .set({
            status: videoUrl.status,
            url: videoUrl.url,
            updatedAt: new Date(),
          })
          .where(eq(chat_video.id, videoUrl.id));
      }
    });

    console.log(`Updated ${videoUrls.length} videos for chatId: ${chatId}`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating video statuses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
