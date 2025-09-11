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
    <nav className="h-16 flex items-center justify-between p-4 top-0 absolute bg-transparent z-10 backdrop-blur-md shadow-md">
      <Button
        onClick={() => toggleSidebar()}
        variant="outline"
        className="h-9 w-9"
      >
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
