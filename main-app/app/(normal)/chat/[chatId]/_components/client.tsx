"use client";
import { authClient } from "@/lib/auth-client";
import React from "react";
import { useRouter } from "next/navigation";
type Props = {
  chatId: string;
};

export default function ChatPage({ chatId }: Props) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  if (!session || !session.user) {
    // router.push("/login");
    // return;
    console.log("no session");
    return <div>no session</div>;
  }

  const userId = session.user.id;
  const userData = localStorage.getItem(`user/${userId}`);

  return <div>client: {chatId}</div>;
}
