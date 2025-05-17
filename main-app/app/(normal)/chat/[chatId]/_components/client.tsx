import { authClient } from "@/lib/auth-client";
import React from "react";
import { useRouter } from "next/navigation";
type Props = {
  chatId: string;
};

export default function client({ chatId }: Props) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  if (!session || !session.user) {
    router.push("/login");
    return null;
  }

  const userId = session.user.id;
  const userData = localStorage.getItem(`user/${userId}`);

  return <div>client: {chatId}</div>;
}
