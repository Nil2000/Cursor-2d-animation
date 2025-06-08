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
import { ChevronDown, PenBox, Plus, PlusCircle } from "lucide-react";
import Link from "next/link";
import FooterUser from "./sidebar-footer/footer-user";
import FooterCredits from "./sidebar-footer/footer-credits";
import { useEffect, useState } from "react";
import axios from "axios";

type ChatSidebarProps = {
  userInfo: UserInfoType;
};

export function ChatSidebar({ userInfo }: ChatSidebarProps) {
  const [chatHistory, setChatHistory] = useState<
    { id: string; title: string }[]
  >([]);

  const init = async () => {
    await axios
      .get("/api/chat/history?limit=5")
      .then((response) => {
        setChatHistory(response.data);
      })
      .catch((error) => {
        console.error("Error fetching chat history:", error);
      });
  };
  useEffect(() => {
    init();
  }, []);

  return (
    <Sidebar className="h-calc(100vh - 4rem)">
      <SidebarHeader className="flex items-center justify-center h-16 font-mono text-2xl font-bold">
        AnimX
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          <SidebarMenuItem className="mx-2">
            <Link href={"/"}>
              <SidebarMenuButton className="cursor-pointer h-10">
                <PenBox className="mr-2 h-4 w-4" />
                New Chat
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
                {chatHistory.length > 0 && (
                  <ul className="mb-2">
                    {chatHistory.map((item) => (
                      <li key={item.id}>
                        <Link href={`/chat/${item.id}`}>
                          <SidebarMenuButton className="cursor-pointer h-10 w-full text-left truncate">
                            {item.title}
                          </SidebarMenuButton>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  variant={"link"}
                  className="text-muted-foreground hover:text-primary w-full"
                >
                  Show more
                </Button>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      <SidebarFooter>
        <FooterCredits />
        <FooterUser userInfo={userInfo} />
      </SidebarFooter>
    </Sidebar>
  );
}
