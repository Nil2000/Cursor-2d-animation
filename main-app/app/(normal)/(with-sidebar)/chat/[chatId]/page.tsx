import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { fetchChatSpaceIfExists } from "@/actions/chatActions";
import ChatPageV2 from "./_components/clientV2";

export default async function page({
  params,
}: {
  params: Promise<{
    chatId: string;
  }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    return <div>Not session</div>;
  }

  const { chatId } = await params;
  const chatSpace = await fetchChatSpaceIfExists(chatId);

  return (
    <ChatPageV2
      chatId={chatId}
      spaceExists={!!chatSpace}
      userInfo={session.user}
      chatTitle={chatSpace?.title || ""}
    />
  );
}
