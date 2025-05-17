"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  chatId: string;
};

export default function ChatPage({ chatId }: Props) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  if (!session || !session.user) {
    return;
  }

  const userId = session.user.id;
  console.log("session", session);
  const localStorageData = localStorage.getItem(`user/${userId}`);
  if (!localStorageData) {
    console.log("no data");
    return <div>no data</div>;
  }
  const userData = JSON.parse(localStorageData);

  if (!userData.lastSearchedFor || userData.lastSearchedFor.chatId !== chatId) {
    router.push("/");
  }

  console.log("userData", userData);
  return (
    <div>
      client: {chatId} {JSON.stringify(userData.lastSearchedFor)}
    </div>
  );
}
