"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, ChevronRight, Clock, ThumbsUp, Truck } from "lucide-react";
import { useComplaintsStore, Complaint, ComplaintStatus } from "@/stores/useComplaintsStore";

function getSeverityColor(score: number | undefined): string {
  if (score === undefined) return "#54A0FF";
  if (score >= 0.75) return "#FF4D4D";
  if (score >= 0.5) return "#FF9F43";
  return "#FECA57";
}

function getStatusStyle(status: ComplaintStatus): { bg: string; text: string } {
  const map: Record<ComplaintStatus, { bg: string; text: string }> = {
    LOGGED: { bg: "rgba(84,160,255,0.15)", text: "#54A0FF" },
    AI_TRIAGED: { bg: "rgba(227,239,38,0.15)", text: "#E3EF26" },
    ASSIGNED: { bg: "rgba(255,159,67,0.15)", text: "#FF9F43" },
    DISPATCHED: { bg: "rgba(255,159,67,0.15)", text: "#FF9F43" },
    RESOLVED: { bg: "rgba(46,213,115,0.15)", text: "#2ED573" },
    DUPLICATE: { bg: "rgba(176,176,176,0.15)", text: "#B0B0B0" },
    REJECTED: { bg: "rgba(255,77,77,0.15)", text: "#FF4D4D" },
  };
  return map[status];
}

function getTierLabel(tier: number): string {
  const labels: Record<number, string> = {
    1: "Manual Sweep",
    2: "Handcart",
    3: "Mini Truck",
    4: "Compactor",
  };
  return labels[tier] ?? "Unknown";
}

interface TriageCardProps {
  complaint: Complaint;
  isSelected: boolean;
  onSelect: () => void;
  onDispatch: () => void;
}

function TriageCard({ complaint, isSelected, onSelect, onDispatch }: TriageCardProps) {
  const { status, aiAnalysis, upvoteCount, createdAt } = complaint;
  const severityColor = getSeverityColor(aiAnalysis?.severityScore);
  const statusStyle = getStatusStyle(status);

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-lg border transition-all duration-200 p-4 group ${
        isSelected ? "bg-card-inner-selected" : "bg-card-inner hover:bg-card-inner-hover"
      }`}
      style={{
        borderColor: isSelected ? severityColor : "var(--border-inner)",
        boxShadow: isSelected ? `0 0 0 1px ${severityColor}44` : "none",
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Severity dot */}
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: severityColor, boxShadow: `0 0 6px ${severityColor}` }}
          />
          <span className="text-xs font-mono text-muted-foreground font-jetbrains-mono">
            #{complaint.id.slice(-6).toUpperCase()}
          </span>
        </div>
        <span
          className="text-xs font-inter font-bold px-2 py-0.5 rounded"
          style={{ background: statusStyle.bg, color: statusStyle.text }}
        >
          {status.replace("_", " ")}
        </span>
      </div>

      {/* Waste classes */}
      {aiAnalysis ? (
        <div className="mb-2">
          <p className="text-sm font-inter text-foreground font-medium mb-1">
            {aiAnalysis.wasteClasses.join(" · ")}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-inter">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {(aiAnalysis.severityScore * 100).toFixed(0)}% severity
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3" />
              {getTierLabel(aiAnalysis.logisticsTier)}
            </span>
          </div>
          {aiAnalysis.hazardFlags.length > 0 && (
            <div className="mt-1.5 flex gap-1 flex-wrap">
              {aiAnalysis.hazardFlags.map((flag) => (
                <span
                  key={flag}
                  className="text-xs px-1.5 py-0.5 rounded font-inter"
                  style={{ background: "rgba(255,77,77,0.15)", color: "#FF4D4D" }}
                >
                  ⚠ {flag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground font-inter italic mb-2">
          Awaiting AI analysis...
        </p>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-inter">
          <span className="flex items-center gap-1" suppressHydrationWarning>
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
          {upvoteCount > 0 && (
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              {upvoteCount}
            </span>
          )}
        </div>
        {status === "AI_TRIAGED" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDispatch();
            }}
            className="flex items-center gap-1 text-xs font-inter font-semibold px-3 py-1.5 rounded-md transition-all"
            style={{ background: "#E3EF26", color: "#061F1A" }}
          >
            Dispatch <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

interface TriageListProps {
  onDispatch: (complaintId: string) => void;
}

export function TriageList({ onDispatch }: TriageListProps) {
  const { complaints, selectedComplaintId, selectComplaint, flyToComplaint } =
    useComplaintsStore();

  // Sort by severity score descending, pending at bottom
  const sorted = [...complaints].sort((a, b) => {
    const scoreA = a.aiAnalysis?.severityScore ?? -1;
    const scoreB = b.aiAnalysis?.severityScore ?? -1;
    return scoreB - scoreA;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <h3 className="font-semibold text-foreground font-philosopher">
          Incident Queue
        </h3>
        <span className="text-xs font-inter text-muted-foreground">
          {complaints.filter((c) => c.status === "AI_TRIAGED").length} pending dispatch
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {sorted.map((complaint) => (
          <TriageCard
            key={complaint.id}
            complaint={complaint}
            isSelected={selectedComplaintId === complaint.id}
            onSelect={() => {
              selectComplaint(complaint.id);
              flyToComplaint(complaint.latitude, complaint.longitude);
            }}
            onDispatch={() => onDispatch(complaint.id)}
          />
        ))}
      </div>
    </div>
  );
}
