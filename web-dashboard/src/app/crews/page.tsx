"use client";

import dynamic from "next/dynamic";
import { CrewList } from "@/components/crews/CrewList";

const IncidentMap = dynamic(
  () => import("@/components/map/IncidentMap").then((m) => m.IncidentMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-inter">Loading live crew map…</p>
        </div>
      </div>
    ),
  }
);

export default function CrewsPage() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-philosopher font-bold text-foreground">
            Field Crews
          </h2>
          <p className="text-sm text-muted-foreground font-inter">
            Live operational roster and GPS tracking for active cleanup teams.
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[400px_1fr] gap-4 min-h-0">
        {/* Left: Crew Roster */}
        <div className="min-h-0 flex flex-col">
          <CrewList />
        </div>

        {/* Right: Live Map */}
        <div className="min-h-0 flex flex-col glass-panel rounded-xl overflow-hidden hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
          <div className="p-3 border-b border-border-subtle pb-3 flex items-center justify-between z-10">
            <h3 className="font-semibold text-foreground font-inter text-sm">Live Location Feed</h3>
          </div>
          <div className="flex-1 min-h-0 relative">
            <IncidentMap showCrews={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
