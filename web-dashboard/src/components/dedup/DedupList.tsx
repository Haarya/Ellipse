"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Clock, GitMerge, FileWarning } from "lucide-react";
import { useComplaintsStore, Complaint } from "@/stores/useComplaintsStore";

interface DedupCardProps {
  complaint: Complaint;
  isSelected: boolean;
  onSelect: () => void;
}

function DedupCard({ complaint, isSelected, onSelect }: DedupCardProps) {
  const { dedup_similarity, dedup_disputed, createdAt, id } = complaint;
  
  // Style based on dispute vs AI flag
  const accentColor = dedup_disputed ? "#FF4D4D" : "#FF9F43";

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-lg border transition-all duration-200 p-4 group ${
        isSelected ? "bg-card-inner-selected" : "bg-card-inner hover:bg-card-inner-hover"
      }`}
      style={{
        borderColor: isSelected ? accentColor : "var(--border-inner)",
        boxShadow: isSelected ? `0 0 12px ${accentColor}44` : "none",
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
            style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
          />
          <span className="text-xs font-mono text-muted-foreground font-jetbrains-mono">
            #{id.slice(-6).toUpperCase()}
          </span>
        </div>
        <span
          className="text-xs font-inter font-bold px-2 py-0.5 rounded flex items-center gap-1"
          style={{ 
            background: `${accentColor}22`, 
            color: accentColor 
          }}
        >
          {dedup_disputed ? (
            <><FileWarning className="w-3 h-3" /> DISPUTED</>
          ) : (
            <><AlertTriangle className="w-3 h-3" /> AI FLAG</>
          )}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm font-inter text-foreground font-medium mb-1 flex items-center gap-2">
          <GitMerge className="w-4 h-4 text-muted-foreground" />
          {dedup_similarity ? (dedup_similarity * 100).toFixed(0) : 0}% Similarity
        </p>
        <p className="text-xs text-muted-foreground font-inter">
          {dedup_disputed 
            ? "Citizen disputed auto-merge. Needs manual verification."
            : "AI flagged as potential duplicate. Review required."}
        </p>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-inter" suppressHydrationWarning>
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}

export function DedupList() {
  const { complaints, selectedDedupReviewId, selectDedupReview, flyToComplaint } = useComplaintsStore();

  // Find complaints needing dedup review
  const dedupQueue = complaints.filter(
    (c) => c.parent_complaint_id && (c.dedup_disputed || (c.dedup_similarity && c.dedup_similarity >= 0.7 && c.dedup_similarity <= 0.9))
  );

  return (
    <div className="flex flex-col h-full glass-panel rounded-xl overflow-hidden hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <h3 className="font-semibold text-foreground font-philosopher">
          Review Queue
        </h3>
        <span className="text-xs font-inter text-muted-foreground">
          {dedupQueue.length} pending
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {dedupQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
            <GitMerge className="w-8 h-8 mb-3 opacity-20" />
            <p className="font-inter text-sm">No duplicates flagged for review.</p>
          </div>
        ) : (
          dedupQueue.map((complaint) => (
            <DedupCard
              key={complaint.id}
              complaint={complaint}
              isSelected={selectedDedupReviewId === complaint.id}
              onSelect={() => {
                selectDedupReview(complaint.id);
                // Also fly the map to the incoming complaint's location just in case they look at the map
                flyToComplaint(complaint.latitude, complaint.longitude);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
