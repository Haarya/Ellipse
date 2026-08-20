"use client";

import { DedupList } from "@/components/dedup/DedupList";
import { DedupPanel } from "@/components/dedup/DedupPanel";

export default function DedupPage() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-philosopher font-bold text-foreground">
            Duplicate Resolution
          </h2>
          <p className="text-sm text-muted-foreground font-inter">
            Manually review and resolve incoming complaints flagged by the AI spatial dedup engine.
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[360px_1fr] gap-4 min-h-0">
        {/* Left: Dedup List Queue */}
        <div className="min-h-0 flex flex-col">
          <DedupList />
        </div>

        {/* Right: Side-by-side Review Panel */}
        <div className="min-h-0 flex flex-col">
          <DedupPanel />
        </div>
      </div>
    </div>
  );
}
