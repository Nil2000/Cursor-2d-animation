import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { ChatSidebar } from "./_components/chat-sidebar";
import ThemeButton from "@/components/theme-button";
import ChatNavbar from "./_components/chat-navbar";
import { cookies } from "next/headers";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <ChatSidebar />
      <main className="flex flex-col w-full min-h-screen overflow-hidden relative flex-1">
        <ChatNavbar />
        {children}
      </main>
    </SidebarProvider>
  );
}
