import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import {
  ChevronDown,
  ChevronUp,
  PenBox,
  Plus,
  PlusCircle,
  User2,
} from "lucide-react";
import Link from "next/link";
import FooterUser from "./sidebar-footer/footer-user";
import FooterCredits from "./sidebar-footer/footer-credits";

type ChatSidebarProps = {
  userInfo: UserInfoType;
};

export function ChatSidebar({ userInfo }: ChatSidebarProps) {
  // + New Chat
  // History
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
                <Link href={"/chat/new"}>
                  <SidebarMenuButton className="cursor-pointer h-10">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Chat
                  </SidebarMenuButton>
                </Link>
                <Link href={"/chat/history"}>
                  <SidebarMenuButton className="cursor-pointer h-10">
                    <Plus className="mr-2 h-4 w-4" />
                    View History
                  </SidebarMenuButton>
                </Link>
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
