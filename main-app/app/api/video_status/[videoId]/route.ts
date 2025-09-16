import { db } from "@/lib/db";
import { chat_video } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;

  if (!videoId) {
    return new NextResponse("Video ID is required", { status: 400 });
  }

  try {
    const videoStatus = await db.query.chat_video.findFirst({
      where: (chat_video, { eq }) => eq(chat_video.id, videoId),
      columns: {
        status: true,
        url: true,
      },
    });
    if (!videoStatus) {
      return new NextResponse("Video not found", { status: 404 });
    }
    return NextResponse.json(videoStatus, { status: 200 });
  } catch (error) {
    console.error("Error fetching video status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;

  if (!videoId) {
    return new NextResponse("Video ID is required", { status: 400 });
  }

  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  const { url, status } = body;

  console.log("URL:", url);
  console.log("Status:", status);

  if (!url || !status) {
    return new NextResponse("URL and status are required", { status: 400 });
  }

  if (status !== "completed" && status !== "failed") {
    return new NextResponse("Invalid status", { status: 400 });
  }

  const secret_key = req.headers.get("x-secret-key");
  if (!secret_key || secret_key !== process.env.INTERNAL_API_KEY) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await db
      .update(chat_video)
      .set({
        status,
        url: url,
        updatedAt: new Date(),
      })
      .where(eq(chat_video.id, videoId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating video status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
