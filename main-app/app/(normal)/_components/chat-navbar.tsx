"use client";
import ThemeButton from "@/components/theme-button";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import React from "react";

export default function ChatNavbar() {
  const { open, toggleSidebar } = useSidebar();
  return (
    <nav className="h-16 flex items-center justify-between p-4 w-full">
      <div>
        <Button
          onClick={() => toggleSidebar()}
          variant="outline"
          className="h-9 w-9"
        >
          {open ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </Button>
      </div>
      <div>
        <ThemeButton />
      </div>
    </nav>
  );
}
