"use client";

import React from "react";

import ThemeButton from "@/components/theme-button";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useChatPage } from "@/components/providers/chat-provider";

export default function ChatNavbar() {
  const { open, toggleSidebar } = useSidebar();
  const { title } = useChatPage();
  return (
    <nav className="flex flex-row h-16 items-center justify-between px-4 bg-transparent">
      <Button onClick={() => toggleSidebar()} variant="outline" size={"icon"}>
        {open ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </Button>
      {title ? (
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
      ) : (
        ""
      )}
      <ThemeButton />
    </nav>
  );
}
