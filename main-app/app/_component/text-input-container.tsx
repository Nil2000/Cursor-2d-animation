"use client";
import TextComponent from "@/components/text-component";
import { Button } from "@/components/ui/button";
import { createId } from "@paralleldrive/cuid2";
import { ArrowUp } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function TextInputContainer() {
  const router = useRouter();
  const [text, setText] = React.useState("");
  const { data: session } = authClient.useSession();
  const handleClick = () => {
    const chatId = createId();
    localStorage.setItem(
      `user/${session?.user.id}`,
      JSON.stringify({
        lastSearchedFor: {
          chatId,
          text,
          STATUS: "PENDING",
        },
      })
    );
    router.push(`/chat/${chatId}`);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!session || !session.user) {
        router.push("/login");
        return;
      }
      handleClick();
    }
  };
  return (
    <div className="w-full max-w-[500px] p-3 z-10 rounded-2xl bg-white shadow-lg dark:bg-zinc-800 ring-1 ring-gray-200 dark:ring-zinc-700">
      <TextComponent
        value={text}
        onChange={setText}
        onKeyDown={handleKeyDown}
      />
      <div className="flex justify-end">
        <Button
          className="rounded-full h-9 w-9"
          disabled={!text || text.length < 1}
          onClick={handleClick}
        >
          <ArrowUp size={18} strokeWidth={3} />
        </Button>
      </div>
    </div>
  );
}
