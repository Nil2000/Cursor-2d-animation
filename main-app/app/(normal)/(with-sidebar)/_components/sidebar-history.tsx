"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, History, Loader2, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type SidebarHistoryProps = {
  history: { id: string; title: string }[];
  limit: number;
  onShowMore: () => void;
  isLoading?: boolean;
};

function formatChatTitle(title: string | null | undefined, maxLength = 30) {
  const text = title?.trim() || "New Chat";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

export function SidebarHistory({
  history,
  limit,
  onShowMore,
  isLoading = false,
}: SidebarHistoryProps) {
  const pathname = usePathname();

  return (
    <Collapsible
      defaultOpen
      className="group/collapsible flex h-full min-h-0 flex-1 flex-col overflow-hidden"
    >
      <SidebarGroup className="flex h-full min-h-0 flex-1 flex-col overflow-hidden px-0">
        <SidebarGroupLabel asChild className="shrink-0">
          <CollapsibleTrigger className="flex w-full items-center rounded-lg px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground">
            <History className="size-3.5" />
            <span className="ml-2">Recent</span>
            <ChevronDown className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent className="min-h-0 flex-1 overflow-hidden data-[state=closed]:hidden">
          <SidebarGroupContent className="flex h-full min-h-0 flex-col overflow-hidden px-1 pb-1">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading chats…
              </div>
            ) : history.length === 0 ? (
              <div className="mx-1 rounded-xl border border-dashed border-sidebar-border bg-sidebar-accent/30 px-3 py-6 text-center">
                <MessageSquareText className="mx-auto mb-2 size-5 text-muted-foreground/50" />
                <p className="text-xs font-medium text-muted-foreground">
                  No conversations yet
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/70">
                  Start a new chat to create your first animation.
                </p>
              </div>
            ) : (
              <>
                <SidebarMenu className="min-h-0 flex-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                  {history.map((item) => {
                    const href = `/chat/${item.id}`;
                    const isActive = pathname === href;

                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title || "New Chat"}
                          className={cn(
                            "h-9 rounded-lg transition-colors",
                            isActive &&
                              "border border-sidebar-border/80 bg-sidebar-accent shadow-sm",
                          )}
                        >
                          <Link href={href}>
                            <MessageSquareText
                              className={cn(
                                "size-4 shrink-0",
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground",
                              )}
                            />
                            <span className="truncate">
                              {formatChatTitle(item.title)}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                  {history.length >= limit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-8 w-full shrink-0 rounded-lg text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      onClick={onShowMore}
                    >
                      <ChevronDown className="mr-1 size-3.5" />
                      Show more
                    </Button>
                  )}
                </SidebarMenu>
              </>
            )}
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
