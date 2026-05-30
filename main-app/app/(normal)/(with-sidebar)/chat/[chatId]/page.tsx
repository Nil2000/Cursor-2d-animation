import React from "react";
import { fetchChatSpaceForUser } from "@/actions/chatActions";
import ChatPage from "./_components/client";
import ChatNotFound from "./_components/chat-not-found";
import { checkAuthentication } from "@/actions/authActions";
import { redirect } from "next/navigation";

export default async function page({
  params,
}: {
  params: Promise<{
    chatId: string;
  }>;
}) {
  const session = await checkAuthentication();
  if (!session) {
    redirect("/login");
  }

  const { chatId } = await params;
  const chatSpace = await fetchChatSpaceForUser(chatId, session.id);

  if (!chatSpace) {
    return <ChatNotFound />;
  }

  return <ChatPage chatId={chatId} userInfo={session} />;
}
