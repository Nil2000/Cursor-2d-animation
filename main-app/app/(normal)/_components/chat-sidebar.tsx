"use client";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronDown, PenBox, CreditCard } from "lucide-react";
import Link from "next/link";
import FooterUser from "./sidebar-footer/footer-user";
import FooterCredits from "./sidebar-footer/footer-credits";
import { UserInfoType } from "@/lib/types";
import { useChatHook } from "@/components/providers/chat-provider";

type ChatSidebarProps = {
  userInfo: UserInfoType;
};

export function ChatSidebar({ userInfo }: ChatSidebarProps) {
  const { limit, setLimit, history, usersCredits, isUserPremium } = useChatHook();

  return (
    <Sidebar className="h-calc(100vh - 4rem)" variant="inset">
      <SidebarHeader className="flex items-center justify-center h-16 font-mono text-2xl font-bold">
        AnimX
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          <SidebarMenuItem className="mx-2">
            <Link href={"/chat"}>
              <SidebarMenuButton className="cursor-pointer h-10">
                <PenBox className="mr-2 h-4 w-4" />
                New Chat
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem className="mx-2">
            <Link href={"/pricing"}>
              <SidebarMenuButton className="cursor-pointer h-10">
                <CreditCard className="mr-2 h-4 w-4" />
                Pricing
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Chat History
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                {history.length > 0 && (
                  <ul className="mb-2">
                    {history.map((item) => (
                      <li key={item.id}>
                        <Link href={`/chat/${item.id}`}>
                          <SidebarMenuButton className="cursor-pointer truncate h-10">
                            {item.title
                              ? item.title.slice(0, 25) + "..."
                              : "New Chat"}
                          </SidebarMenuButton>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  variant={"link"}
                  className="text-muted-foreground hover:text-primary w-full"
                  onClick={() => {
                    setLimit(limit + 5);
                  }}
                >
                  Show more
                </Button>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      <SidebarFooter>
        <FooterCredits
          usersCredits={usersCredits}
          isUserPremium={isUserPremium}
        />
        <FooterUser userInfo={userInfo} />
      </SidebarFooter>
    </Sidebar>
  );
}
