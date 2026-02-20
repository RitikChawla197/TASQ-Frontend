"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar";
import { ReduxProvider } from "@/store/provider";
import { TaskDialogProvider } from "@/components/dialogbox/taskdialogcontext";
import { KanbanFilterProvider } from "@/components/kanban/kanbanfiltercontext";

const AppSidebar = dynamic(() => import("@/components/AppSidebar"), {
  ssr: false,
});

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [defaultOpen, setDefaultOpen] = useState(true);
  const hideShell = pathname === "/projects/settings";

  return (
    <ReduxProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <KanbanFilterProvider>
          <TaskDialogProvider>
            {hideShell ? (
              <main className="min-h-screen flex-1 w-full overflow-x-auto px-4 py-4">
                {children}
              </main>
            ) : (
              <div className="flex min-h-screen w-full overflow-hidden">
                <AppSidebar />
                <main className="relative flex-1 min-w-0 overflow-x-hidden">
                  <Navbar />
                  {/* <Toaster richColors position="top-right" /> */}
                  <div className="px-4 py-1 overflow-x-auto">{children}</div>
                </main>
              </div>
            )}
          </TaskDialogProvider>
        </KanbanFilterProvider>
      </SidebarProvider>
    </ReduxProvider>
  );
}
