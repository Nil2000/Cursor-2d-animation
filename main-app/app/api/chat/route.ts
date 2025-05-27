import { addChatToSpace, createChatSpace } from "@/lib/chat-utls/spaceActions";
import { generateChatCompletions } from "@/lib/chat-utls/getChatCompletions";
import { streamTextForChat } from "@/lib/chat-utls/streamText";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { chatId, message } = await req.json();

  if (!chatId || !message) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // const { textStream, providerMetadata } = streamTextForChat({
  //   message,
  //   previousContextId: chatId,
  // });

  // return new NextResponse(textStream);
  try {
    const newChatSpace = await createChatSpace(chatId);

    await addChatToSpace(newChatSpace[0].id, "user", message);

    const textResponse = await generateChatCompletions({
      message,
    });

    console.log("Text response from chat completions:", textResponse);

    const newChat = await addChatToSpace(
      newChatSpace[0].id,
      "assistant",
      textResponse.text,
      textResponse.contextId
    );

    return NextResponse.json(
      { response: newChat, contextId: textResponse.contextId },
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
