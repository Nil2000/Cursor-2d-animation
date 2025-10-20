import React from "react";
import { fetchChatSpaceIfExists } from "@/actions/chatActions";
import ChatPageV2 from "./_components/clientV2";
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
    <ChatPageV2 chatId={chatId} spaceExists={!!chatSpace} userInfo={session} />
  );
}
