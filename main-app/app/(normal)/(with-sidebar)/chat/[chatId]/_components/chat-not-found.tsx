"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquareOff } from "lucide-react";

export default function ChatNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
        <MessageSquareOff className="w-8 h-8 text-primary" />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">Chat not found</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        This conversation doesn&apos;t exist or you don&apos;t have access to it.
      </p>

      <Button asChild>
        <Link href="/chat">Start a new chat</Link>
      </Button>
    </div>
  );
}
