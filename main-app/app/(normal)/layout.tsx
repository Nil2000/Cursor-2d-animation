import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { ChatSidebar } from "./_components/chat-sidebar";
import ThemeButton from "@/components/theme-button";
import ChatNavbar from "./_components/chat-navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <main className="flex flex-col w-screen min-h-screen">
        <ChatNavbar />
        {children}
      </main>
    </SidebarProvider>
  );
}
