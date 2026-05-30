"use client";

import React from "react";
import { useRouter } from "next/navigation";
import TextComponent from "@/components/text-component";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader, Send } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useChatHook } from "@/components/providers/chat-provider";
import { toast } from "sonner";
import { useFetch } from "@/hooks/use-fetch";

export default function Client() {
  const router = useRouter();
  const [inputText, setInputText] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);
  const { data: session } = authClient.useSession();
  const { setPendingBootstrap } = useChatHook();
  const { fetchData } = useFetch<{ chatId: string }>();

  const handleSendMessage = async () => {
    if (!inputText || inputText.trim().length === 0 || isCreating) {
      return;
    }

    if (!session || !session.user) {
      router.push("/login");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetchData("/api/chat/create", {
        method: "POST",
      });

      if (!response.ok) {
        const raw = await response.json().catch(() => null);
        const errMsg =
          raw &&
          typeof raw === "object" &&
          "error" in raw &&
          typeof (raw as { error: unknown }).error === "string"
            ? (raw as { error: string }).error
            : "Could not create chat";
        toast.error("Could not start chat", { description: errMsg });
        return;
      }

      const { chatId } = (await response.json()) as { chatId: string };

      setPendingBootstrap({ chatId, message: inputText });
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Could not start chat", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
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
            disabled={isCreating}
          />
          <div className="flex justify-end items-center gap-2">
            <Button
              size={"icon"}
              onClick={() => void handleSendMessage()}
              disabled={
                !inputText || inputText.trim().length === 0 || isCreating
              }
            >
              {isCreating ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
