import AppHeader from "@/components/custom/dashboard/AppHeader";
import { AppSidebar } from "@/components/custom/dashboard/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <AppHeader />
        {children}
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
