"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Archive, LayoutGrid, Settings, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export function AppSidebar() {
  const path = usePathname();
  const { user } = useUser();
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 pt-2">
          <Image src={"/logo.svg"} alt="Logo" height={32} width={32} />
          <h2 className="text-xl font-bold">Whizboard</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Button className="w-full">+ Create New Board</Button>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>My Boards</SidebarGroupLabel>
          <SidebarMenuButton className="p-5" isActive={path === "/dashboard"}>
            <LayoutGrid />
            <span>All Files</span>
          </SidebarMenuButton>
          <SidebarMenuButton
            className="p-5 mt-2"
            isActive={path === "/shared-files"}
          >
            <Users />
            <span>Shared</span>
          </SidebarMenuButton>
          <SidebarMenuButton
            className="p-5 mt-2"
            isActive={path === "/archived"}
          >
            <Archive />
            <span>Archived</span>
          </SidebarMenuButton>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>My Boards</SidebarGroupLabel>
          <SidebarMenuButton className="p-5" isActive={path === "/ai"}>
            <Sparkles />
            <span>AI Helper</span>
          </SidebarMenuButton>
          <SidebarMenuButton
            className="p-5 mt-2"
            isActive={path === "/settings"}
          >
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button className="w-full">+ Create New Board</Button>
        <div className="p-4 my-3 border rounded-md">
          <h2 className="text-sm flex justify-between mb-1">
            2 files created <span>total 3</span>
          </h2>
          <Progress value={66} className={"mt-2 h-2"} />
        </div>
        <div className="flex items-center gap-3 p-2">
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
              {user?.firstName?.[0] || "U"}
            </div>
          )}
          <div className="flex flex-col truncate">
            <span className="text-sm font-medium truncate">
              {user?.fullName || user?.firstName || "User"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
