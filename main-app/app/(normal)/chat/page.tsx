"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createId } from "@paralleldrive/cuid2";
import TextComponent from "@/components/text-component";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ChatPage() {
  const router = useRouter();
  const [inputText, setInputText] = React.useState("");
  const { data: session } = authClient.useSession();

  const handleSendMessage = () => {
    if (!inputText || inputText.trim().length === 0) {
      return;
    }

    if (!session || !session.user) {
      router.push("/login");
      return;
    }

    const chatId = createId();
    
    // Store message in localStorage
    localStorage.setItem(
      `user/${session.user.id}`,
      JSON.stringify({
        lastSearchedFor: {
          chatId,
          text: inputText,
          STATUS: "PENDING",
        },
      })
    );

    // Redirect to chat page with the new chatId
    router.push(`/chat/${chatId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] px-4">
      <div className="w-full max-w-[700px] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-400">
            Start a New Conversation
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Type your message below to begin creating animations
          </p>
        </div>

        <Card className="w-full rounded-lg min-h-16 p-2 flex flex-col justify-between gap-2">
          <TextComponent
            onChange={(value: string) => setInputText(value)}
            value={inputText}
            onKeyDown={handleKeyDown}
          />
          <div className="flex justify-end items-center gap-2">
            <Button
              size={"icon"}
              onClick={handleSendMessage}
              disabled={!inputText || inputText.trim().length === 0}
            >
              <Send size={16} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
