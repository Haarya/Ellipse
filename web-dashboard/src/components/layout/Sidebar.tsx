"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  ListTodo,
  GitMerge,
  Users,
  Settings,
  BarChart3,
} from "lucide-react";
import { useAuthStore, UserRole } from "@/stores/useAuthStore";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
};

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/", icon: LayoutDashboard, roles: ["DISPATCHER", "OFFICER", "ADMIN"] },
  { name: "GIS Map", href: "/map", icon: Map, roles: ["DISPATCHER", "OFFICER", "ADMIN"] },
  { name: "Triage & Dispatch", href: "/triage", icon: ListTodo, roles: ["DISPATCHER", "OFFICER", "ADMIN"] },
  { name: "Dedup Review", href: "/dedup", icon: GitMerge, roles: ["OFFICER", "ADMIN"] },
  { name: "Field Crews", href: "/crews", icon: Users, roles: ["DISPATCHER", "ADMIN"] },
  { name: "Analytics", href: "/analytics", icon: BarChart3, roles: ["OFFICER", "ADMIN"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const role = user?.role ?? "DISPATCHER";
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside
      className="w-64 h-full flex flex-col flex-shrink-0 glass-panel border-r border-border-subtle z-10"
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-philosopher font-bold text-accent-lime flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 bg-gradient-to-br from-accent-lime to-accent-teal text-abyssal-dark"
          >
            E
          </div>
          Ellipse
        </h1>
        <p className="text-xs text-text-muted mt-1 font-inter">
          Authority Command Center
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-inter transition-all duration-300 group ${isActive
                ? "bg-gradient-to-r from-accent-lime/20 to-transparent border-l-4 border-accent-lime text-text-primary font-semibold"
                : "text-text-muted hover:bg-surface-subtle/50 hover:text-text-primary border-l-4 border-transparent"
                }`}
            >
              <item.icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? "text-accent-lime" : "text-text-muted group-hover:text-text-primary"
                  }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Spacer to keep nav pushed up if needed, though flex-1 handles it */}
    </aside>
  );
}
