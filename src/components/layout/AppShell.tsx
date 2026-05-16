import type { PropsWithChildren } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <DesktopSidebar />
      <div className="min-h-screen md:pl-72">
        <AppHeader />
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
