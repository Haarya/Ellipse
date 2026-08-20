"use client";

import dynamic from "next/dynamic";
import { AlertTriangle, CheckCircle, Clock, Users } from "lucide-react";
import { useComplaintsStore } from "@/stores/useComplaintsStore";

const IncidentMap = dynamic(
  () => import("@/components/map/IncidentMap").then((m) => m.IncidentMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-background/20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-inter">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export default function DashboardOverview() {
  const { complaints } = useComplaintsStore();
  const active = complaints.filter((c) => !["RESOLVED", "REJECTED", "DUPLICATE"].includes(c.status)).length;
  const triaged = complaints.filter((c) => c.status === "AI_TRIAGED").length;
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;

  const stats = [
    { name: "Active Complaints", value: String(active), icon: AlertTriangle, color: "text-destructive" },
    { name: "Resolved Today", value: String(resolved), icon: CheckCircle, color: "text-primary" },
    { name: "Pending AI Triage", value: String(triaged), icon: Clock, color: "text-accent" },
    { name: "Field Crews Active", value: "8", icon: Users, color: "text-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-philosopher font-bold text-foreground">Overview</h2>
        <div className="text-sm text-muted-foreground font-inter">
          Last updated: Just now
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="glass-panel rounded-xl p-5 hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg bg-surface-subtle text-accent-lime border border-border-subtle ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted font-inter">{stat.name}</p>
              <p className="font-bold text-3xl text-text-primary tracking-tight font-jetbrains-mono">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Placeholder for Map */}
        <div className="lg:col-span-2 glass-panel-elevated rounded-2xl p-4 overflow-hidden flex flex-col gap-3">
          <div className="px-2">
            <h3 className="font-semibold text-text-primary font-inter">Live Incident Map</h3>
          </div>
          <div className="flex-1 min-h-0 relative glow-teal rounded-xl overflow-hidden border border-border-highlight">
            <IncidentMap />
          </div>
        </div>

        {/* Placeholder for Recent Activity */}
        <div className="glass-panel rounded-xl flex flex-col overflow-hidden gradient-border-top p-4 gap-3">
          <div className="px-1 border-b border-border-subtle pb-3">
            <h3 className="font-semibold text-text-primary font-inter">Recent Activity</h3>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 items-start border-b border-border-subtle pb-4 last:border-0 hover:bg-surface-subtle/50 p-2 rounded-lg transition-colors cursor-default">
                <div className="w-2 h-2 mt-2 rounded-full bg-accent-lime shadow-[0_0_8px_rgba(227,239,38,0.6)] flex-shrink-0" />
                <div>
                  <p className="text-sm text-text-primary font-inter">New complaint logged in Zone {i}</p>
                  <p className="text-xs text-text-muted font-inter mt-1">{i * 5} mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
