import { addChatToSpace, createChatSpace } from "@/lib/chat-utls/spaceActions";
import { generateChatCompletions } from "@/lib/chat-utls/getChatCompletions";
import { streamTextForChat } from "@/lib/chat-utls/streamText";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { chatId, message, contextId } = await req.json();

  if (!chatId || !message) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const newChatSpace = await createChatSpace(chatId);

    await addChatToSpace(newChatSpace[0].id, "user", message);

    const textResponse = await generateChatCompletions({
      message,
      previousContextId: contextId || undefined,
    });

    if (!textResponse || !textResponse.text) {
      return NextResponse.json(
        { error: "Failed to generate response" },
        { status: 500 }
      );
    }

    console.log("Text response from chat completions:", textResponse);

    await addChatToSpace(
      newChatSpace[0].id,
      "assistant",
      textResponse.text,
      textResponse.contextId
    );

    return NextResponse.json(
      { response: textResponse.text, contextId: textResponse.contextId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating chat completions", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
