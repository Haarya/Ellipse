/* eslint-disable @next/next/no-img-element */
"use client";

import { useComplaintsStore } from "@/stores/useComplaintsStore";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Clock, MapPin, Merge } from "lucide-react";

export function DedupPanel() {
  const { complaints, selectedDedupReviewId, resolveDedup } = useComplaintsStore();

  if (!selectedDedupReviewId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center glass-panel rounded-xl text-muted-foreground p-8 hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
        <Merge className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-xl font-philosopher font-semibold text-foreground mb-2">
          Select a review task
        </h3>
        <p className="font-inter text-sm max-w-md text-center">
          Choose a flagged complaint from the queue to compare it alongside its potential duplicate.
        </p>
      </div>
    );
  }

  const incoming = complaints.find((c) => c.id === selectedDedupReviewId);
  const parent = complaints.find((c) => c.id === incoming?.parent_complaint_id);

  if (!incoming || !parent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center glass-panel rounded-xl p-8 text-destructive hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
        Error loading complaint data.
      </div>
    );
  }

  // Calculate rough distance in coords (just for UI mock)
  const distLat = Math.abs(incoming.latitude - parent.latitude);
  const distLng = Math.abs(incoming.longitude - parent.longitude);
  const approximateMeters = Math.round((distLat + distLng) * 111139); // Rough degree to meters
  
  const timeDiff = Math.abs(new Date(incoming.createdAt).getTime() - new Date(parent.createdAt).getTime());
  const hoursDiff = (timeDiff / (1000 * 60 * 60)).toFixed(1);

  const handleResolve = (resolution: "MERGE" | "SEPARATE") => {
    resolveDedup(incoming.id, resolution);
  };

  return (
    <div className="flex-1 flex flex-col glass-panel rounded-xl overflow-hidden hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <div>
          <h2 className="text-xl font-philosopher font-bold text-foreground">
            Similarity Review
          </h2>
          <p className="text-sm font-inter text-muted-foreground mt-0.5">
            Compare incoming report against the existing logged incident.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-jetbrains-mono font-bold" style={{ color: incoming.dedup_disputed ? "#FF4D4D" : "#FF9F43" }}>
            {(incoming.dedup_similarity! * 100).toFixed(0)}% MATCH
          </div>
          <div className="text-xs font-inter uppercase tracking-wide text-muted-foreground">
            {incoming.dedup_disputed ? "Citizen Disputed" : "AI Confidence"}
          </div>
        </div>
      </div>

      {/* Side-by-side content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-6 h-full">
          {/* PARENT COMPLAINT */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-inter font-semibold text-muted-foreground">Existing Incident</h3>
              <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                #{parent.id.slice(-6).toUpperCase()}
              </span>
            </div>
            
            <div className="relative aspect-video rounded-xl overflow-hidden border border-border">
              <img 
                src={parent.rawImageUrl} 
                alt="Parent Complaint" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-inter text-white flex gap-3">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  {formatDistanceToNow(new Date(parent.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            <div className="bg-card-inner p-4 rounded-xl border border-border-inner">
              <h4 className="text-sm font-inter text-muted-foreground mb-2">AI Analysis</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold text-[#2ED573]">{parent.status}</span>
                </div>
                {parent.aiAnalysis && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Severity</span>
                      <span className="font-semibold">{(parent.aiAnalysis.severityScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Classes</span>
                      <span className="font-medium text-foreground">{parent.aiAnalysis.wasteClasses.join(", ")}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* INCOMING COMPLAINT */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-inter font-semibold text-primary">Incoming Report</h3>
              <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded border border-primary/30">
                #{incoming.id.slice(-6).toUpperCase()}
              </span>
            </div>
            
            <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-primary/50 shadow-[0_0_15px_rgba(227,239,38,0.15)]">
              <img 
                src={incoming.rawImageUrl} 
                alt="Incoming Complaint" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-inter text-white flex gap-3">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-primary" />
                  {formatDistanceToNow(new Date(incoming.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            <div className="bg-card-inner-selected p-4 rounded-xl border border-primary/20">
              <h4 className="text-sm font-inter text-muted-foreground mb-2">AI Analysis</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold text-[#FF9F43]">{incoming.status}</span>
                </div>
                {incoming.aiAnalysis && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Severity</span>
                      <span className="font-semibold">{(incoming.aiAnalysis.severityScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Classes</span>
                      <span className="font-medium text-foreground">{incoming.aiAnalysis.wasteClasses.join(", ")}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delta Analysis Bar */}
        <div className="mt-6 p-4 rounded-xl border border-border bg-background/30 flex items-center justify-center gap-12 text-sm font-inter">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="font-semibold text-foreground">~{approximateMeters}m</span> apart
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-semibold text-foreground">{hoursDiff}h</span> time difference
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-border bg-background/50 flex gap-4">
        <button
          onClick={() => handleResolve("MERGE")}
          className="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 font-inter font-bold text-sm transition-all bg-card-inner hover:bg-card-inner-hover text-text-primary border border-border-inner"
        >
          <Merge className="w-4 h-4" />
          Merge (Mark Duplicate)
        </button>
        <button
          onClick={() => handleResolve("SEPARATE")}
          className="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 font-inter font-bold text-sm transition-all text-abyssal-dark bg-accent-lime hover:bg-accent-lime/90"
        >
          <CheckCircle2 className="w-4 h-4" />
          Distinct Incident (Separate)
        </button>
      </div>
    </div>
  );
}
