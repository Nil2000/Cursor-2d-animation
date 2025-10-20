import { db } from "@/lib/db";
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
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messages", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ chatSpaceId: string }> }
// ) {
//   const { chatSpaceId } = await params;
//   const { message, contextId } = await req.json();

//   if (!chatSpaceId || !message || !contextId) {
//     return new Response("Invalid request", { status: 400 });
//   }

//   try {
//     await addChatToSpace(chatSpaceId, "user", message);

//     const response = await generateChatCompletions({
//       message,
//       previousContextId: contextId,
//     });

//     await addChatToSpace(
//       chatSpaceId,
//       "assistant",
//       response.text,
//       response.contextId
//     );

//     return NextResponse.json(
//       { response: response.text, contextId: response.contextId },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error creating chat message", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
