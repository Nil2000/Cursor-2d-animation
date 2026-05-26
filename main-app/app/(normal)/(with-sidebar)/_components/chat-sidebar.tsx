"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, Sparkles } from "lucide-react";
import Logo from "@/components/logo";
import { useChatHook } from "@/components/providers/chat-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserInfoType } from "@/lib/types";
import { cn } from "@/lib/utils";
import FooterCredits from "./sidebar-footer/footer-credits";
import FooterUser from "./sidebar-footer/footer-user";
import { SidebarHistory } from "./sidebar-history";

type ChatSidebarProps = {
  userInfo: UserInfoType;
};

export function ChatSidebar({ userInfo }: ChatSidebarProps) {
  const pathname = usePathname();
  const {
    limit,
    setLimit,
    history,
    usersCredits,
    isUserPremium,
    creditsLoading,
  } = useChatHook();

  const isNewChatActive = pathname === "/chat";

  return (
    <Sidebar
      variant="inset"
      collapsible="offcanvas"
      className="border-r border-sidebar-border/60"
    >
      <SidebarHeader className="flex shrink-0 flex-col items-center gap-2 border-b border-sidebar-border/60 px-3 py-4">
        <Link
          href="/chat"
          aria-label="Manim home"
          className="flex items-center gap-2 rounded-xl px-1 transition-opacity hover:opacity-90"
        >
          <Logo
            showWordmark
            className="border border-sidebar-border/80"
            wordmarkClassName="text-lg font-bold"
          />
        </Link>
        <p className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-muted-foreground mx-auto">
          <Sparkles className="size-3 text-primary" />
          Animation studio
        </p>
      </SidebarHeader>

      <SidebarContent className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-2 py-3">
        <SidebarMenu className="shrink-0">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isNewChatActive}
              tooltip="New Chat"
              className={cn(
                "h-10 rounded-xl font-medium shadow-sm transition-all",
                isNewChatActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  : "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
              )}
            >
              <Link href="/chat">
                <PenLine className="size-4" />
                <span>New Chat</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden">
          <SidebarHistory
            history={history}
            limit={limit}
            onShowMore={() => setLimit(limit + 5)}
          />
        </div>
      </SidebarContent>

      <SidebarFooter className="shrink-0 gap-2 border-t border-sidebar-border/60 bg-sidebar-accent/20 p-2">
        <FooterCredits
          usersCredits={usersCredits}
          isUserPremium={isUserPremium}
          creditsLoading={creditsLoading}
        />
        <FooterUser userInfo={userInfo} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
