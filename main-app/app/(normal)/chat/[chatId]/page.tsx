import React from "react";
import ChatPage from "./_components/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
    return <div>no session</div>;
  }

  const { chatId } = await params;
  return <ChatPage chatId={chatId} />;
}
