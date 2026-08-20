"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { TriageList } from "@/components/triage/TriageList";
import { DispatchModal } from "@/components/triage/DispatchModal";

// MapLibre uses browser APIs — must be dynamically imported with ssr: false
const IncidentMap = dynamic(
  () => import("@/components/map/IncidentMap").then((m) => m.IncidentMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-surface rounded-lg border border-border">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-inter">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export default function TriagePage() {
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-philosopher font-bold text-foreground">
            Triage & Dispatch
          </h2>
          <p className="text-sm text-muted-foreground font-inter">
            Live incident queue · Click a pin or card to select
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[360px_1fr] gap-4 min-h-0">
        {/* Left: Triage List */}
        <div className="glass-panel rounded-xl overflow-hidden flex flex-col hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
          <TriageList onDispatch={(id) => setDispatchingId(id)} />
        </div>

        {/* Right: MapLibre Map */}
        <div className="min-h-0 flex flex-col glass-panel rounded-xl overflow-hidden hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1 relative glow-teal">
          <div className="flex-1 min-h-0 relative z-10 border border-border-highlight m-3 rounded-xl overflow-hidden">
            <IncidentMap />
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      {dispatchingId && (
        <DispatchModal
          complaintId={dispatchingId}
          onClose={() => setDispatchingId(null)}
        />
      )}
    </div>
  );
}
