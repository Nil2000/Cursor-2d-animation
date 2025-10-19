import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React from "react";
import { ChatSidebar } from "./_components/chat-sidebar";
import ThemeButton from "@/components/theme-button";
import ChatNavbar from "./_components/chat-navbar";
import { cookies, headers } from "next/headers";
import { ChatPageProvider } from "@/components/providers/chat-provider";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    notFound();
  }
  return (
    <ChatPageProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <ChatSidebar userInfo={session?.user} />
        <SidebarInset>
          <main className="flex flex-col min-h-[calc(100vh-1rem)] overflow-hidden relative flex-1">
            <ChatNavbar />
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ChatPageProvider>
  );
}
