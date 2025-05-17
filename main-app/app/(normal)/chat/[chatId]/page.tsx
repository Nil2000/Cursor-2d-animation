import React from "react";
import ChatPage from "./_components/client";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function page({
  params,
}: {
  params: Promise<{
    chatId: string;
  }>;
}) {
  // const session=await auth.api.getSession({
  //   headers:await headers(),
  // })

  // if (!session || !session.user) {
  //   redirect("/login");
  //   return;
  // }

  const { chatId } = await params;
  // return <ChatPage chatId={chatId} />;
  return (
    <div>
      <h1>Chat</h1>
      <p>Chat ID: {chatId}</p>
    </div>
  );
}
