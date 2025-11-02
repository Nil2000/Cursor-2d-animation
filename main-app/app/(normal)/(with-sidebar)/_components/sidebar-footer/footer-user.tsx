"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { EllipsisVertical, DollarSign, Receipt } from "lucide-react";
import React from "react";
import Link from "next/link";
import {
  IconCreditCard,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { UserInfoType } from "@/lib/types";

type FooterUserProps = {
  userInfo: UserInfoType;
};
export default function FooterUser({ userInfo }: FooterUserProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size={"lg"}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userInfo.image!} alt={userInfo.name} />
                <AvatarFallback className="rounded-lg">
                  {userInfo.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userInfo.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {userInfo.email}
                </span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={"bottom"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userInfo.image!} alt={userInfo.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userInfo.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {userInfo.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={"/pricing"}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Pricing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={"/payments"}>
                  <IconCreditCard className="mr-2 h-4 w-4" />
                  Payments
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={"/transactions"}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Transactions
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await authClient.signOut();
              }}
            >
              <IconLogout className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
