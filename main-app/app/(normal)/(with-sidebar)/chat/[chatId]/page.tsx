import React from "react";
import { fetchChatSpaceIfExists } from "@/actions/chatActions";
import ChatPage from "./_components/client";
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
  const chatSpace = await fetchChatSpaceIfExists(chatId);

  return (
    <ChatPage chatId={chatId} spaceExists={!!chatSpace} userInfo={session} />
  );
}
