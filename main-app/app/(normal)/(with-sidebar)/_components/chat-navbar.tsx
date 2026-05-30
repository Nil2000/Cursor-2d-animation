"use client";

import ThemeButton from "@/components/theme-button";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function ChatNavbar() {
  const { open, toggleSidebar } = useSidebar();

  return (
    <nav className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-md">
      <Button
        onClick={() => toggleSidebar()}
        variant="outline"
        size="icon"
        className="size-9 rounded-lg border-border/70 bg-background/60 shadow-sm"
        aria-label={open ? "Close sidebar" : "Open sidebar"}
      >
        {open ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </Button>
      <ThemeButton />
    </nav>
  );
}
