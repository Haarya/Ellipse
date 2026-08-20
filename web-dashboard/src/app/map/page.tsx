"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Layers, Filter, X } from "lucide-react";
import { useComplaintsStore, ComplaintStatus } from "@/stores/useComplaintsStore";

const IncidentMap = dynamic(
  () => import("@/components/map/IncidentMap").then((m) => m.IncidentMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-inter">Loading map…</p>
        </div>
      </div>
    ),
  }
);

type LayerKey = "active" | "resolved" | "heatmap" | "wards";

const STATUS_FILTERS: { label: string; value: ComplaintStatus | "ALL" }[] = [
  { label: "All",        value: "ALL" },
  { label: "Logged",     value: "LOGGED" },
  { label: "AI Triaged", value: "AI_TRIAGED" },
  { label: "Dispatched", value: "DISPATCHED" },
  { label: "Resolved",   value: "RESOLVED" },
];

export default function MapPage() {
  const { complaints } = useComplaintsStore();

  // Layer toggles
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    active:  true,
    resolved: true,
    heatmap: false,
    wards:   false,
  });

  // Status filter
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "ALL">("ALL");

  // Severity range
  const [severityMin, setSeverityMin] = useState(0);

  const [showFilters, setShowFilters] = useState(false);

  const toggleLayer = (key: LayerKey) =>
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  // Stats based on current store
  const stats = useMemo(() => {
    const critical  = complaints.filter((c) => (c.aiAnalysis?.severityScore ?? 0) >= 0.75).length;
    const moderate  = complaints.filter((c) => { const s = c.aiAnalysis?.severityScore ?? 0; return s >= 0.5 && s < 0.75; }).length;
    const low       = complaints.filter((c) => { const s = c.aiAnalysis?.severityScore ?? 0; return s > 0 && s < 0.5; }).length;
    const resolved  = complaints.filter((c) => c.status === "RESOLVED").length;
    return { critical, moderate, low, resolved, total: complaints.length };
  }, [complaints]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col gap-0 -m-6 relative">

      {/* ── Floating Layer Controls (top-left) ───────────────────────── */}
      <div
        className="absolute top-8 left-10 z-10 rounded-xl p-3 flex flex-col gap-2 glass-panel"
        style={{ minWidth: "160px" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-inter font-bold uppercase tracking-wider text-muted-foreground">Layers</span>
        </div>
        {(
          [
            { key: "active",   label: "Active Complaints" },
            { key: "resolved", label: "Resolved" },
            { key: "heatmap",  label: "Heatmap (mock)" },
            { key: "wards",    label: "Ward Boundaries" },
          ] as { key: LayerKey; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            className="flex items-center gap-2.5 text-xs font-inter transition-colors"
            style={{ color: layers[key] ? "#E3EF26" : "#B0B0B0" }}
          >
            <div
              className="w-3.5 h-3.5 rounded-sm border transition-all flex-shrink-0 flex items-center justify-center"
              style={{
                background: layers[key] ? "#E3EF26" : "transparent",
                borderColor: layers[key] ? "#E3EF26" : "#B0B0B0",
              }}
            >
              {layers[key] && (
                <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
                  <path d="M1.5 5l3 3 4-5" stroke="#061F1A" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            {label}
          </button>
        ))}
      </div>

      {/* ── Floating Filter Toggle (top-right) ───────────────────────── */}
      <div className="absolute top-4 right-14 z-10 flex gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-inter font-semibold transition-all"
          style={{
            background: showFilters ? "rgba(227,239,38,0.15)" : "rgba(6,31,26,0.85)",
            color: showFilters ? "#E3EF26" : "#F0F0F0",
            backdropFilter: "blur(12px)",
            border: `0.5px solid ${showFilters ? "rgba(227,239,38,0.4)" : "rgba(255,255,255,0.12)"}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
        </button>
      </div>

      {/* ── Filter Panel (slides in top-right) ───────────────────────── */}
      {showFilters && (
        <div
          className="absolute top-14 right-4 z-10 rounded-xl p-4 w-56 glass-panel-elevated"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-inter font-bold uppercase tracking-wider text-muted-foreground">
              Filter Complaints
            </span>
            <button onClick={() => setShowFilters(false)}>
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Status */}
          <div className="mb-4">
            <p className="text-xs font-inter text-muted-foreground mb-2">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className="px-2.5 py-1 rounded-lg text-xs font-inter transition-all"
                  style={{
                    background: statusFilter === value ? "rgba(227,239,38,0.15)" : "#0F3D33",
                    color: statusFilter === value ? "#E3EF26" : "#B0B0B0",
                    border: `1px solid ${statusFilter === value ? "rgba(227,239,38,0.4)" : "rgba(7,102,83,0.4)"}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <p className="text-xs font-inter text-muted-foreground mb-2">
              Min Severity: <span style={{ color: "#E3EF26" }}>{(severityMin * 100).toFixed(0)}%</span>
            </p>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={severityMin}
              onChange={(e) => setSeverityMin(Number(e.target.value))}
              className="w-full accent-[#E3EF26]"
            />
          </div>
        </div>
      )}

      {/* ── Bottom Stats Bar ─────────────────────────────────────────── */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-5 px-6 py-3 rounded-2xl glass-panel-elevated"
      >
        {[
          { label: "Critical",  count: stats.critical,  color: "#FF4D4D" },
          { label: "Moderate",  count: stats.moderate,  color: "#FF9F43" },
          { label: "Low",       count: stats.low,       color: "#FECA57" },
          { label: "Resolved",  count: stats.resolved,  color: "#2ED573" },
          { label: "Total",     count: stats.total,     color: "#F0F0F0" },
        ].map(({ label, count, color }, i, arr) => (
          <div key={label} className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-lg font-jetbrains-mono font-bold" style={{ color }}>
                {count}
              </p>
              <p className="text-xs font-inter text-muted-foreground">{label}</p>
            </div>
            {i < arr.length - 1 && (
              <div className="w-px h-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* ── Elevated Map Container ──────────────────────────────────────── */}
      <div className="flex-1 w-full h-full p-6">
        <div className="w-full h-full glass-panel-elevated rounded-2xl p-4 overflow-hidden flex flex-col relative z-0">
          <div className="flex-1 w-full h-full relative glow-teal rounded-xl overflow-hidden border border-border-highlight">
            <IncidentMap />
          </div>
        </div>
      </div>
    </div>
  );
}
