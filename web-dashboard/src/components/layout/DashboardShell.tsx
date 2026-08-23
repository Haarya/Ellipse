"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useComplaintsStore } from "@/stores/useComplaintsStore";
import { useCrewsStore } from "@/stores/useCrewsStore";

const NO_SHELL_ROUTES = ["/login", "/landing"];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isShellless = NO_SHELL_ROUTES.some((r) => pathname.startsWith(r));
  const fetchComplaints = useComplaintsStore((state) => state.fetchComplaints);
  const fetchCrews = useCrewsStore((state) => state.fetchCrews);

  useEffect(() => {
    if (!isShellless) {
      fetchComplaints();
      fetchCrews();
    }
  }, [isShellless, fetchComplaints, fetchCrews]);

  if (isShellless) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto bg-surface/50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
