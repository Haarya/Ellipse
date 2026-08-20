"use client";

import { useCrewsStore, FieldCrew } from "@/stores/useCrewsStore";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Truck, Users } from "lucide-react";
import { useComplaintsStore } from "@/stores/useComplaintsStore";

const STATUS_CONFIG = {
  AVAILABLE:  { label: "Available",  color: "#2ED573" },
  DISPATCHED: { label: "Dispatched", color: "#FF9F43" },
  ON_SITE:    { label: "On Site",    color: "#54A0FF" },
  RETURNING:  { label: "Returning",  color: "#E3EF26" },
};

function CrewCard({ crew, isSelected, onSelect }: { crew: FieldCrew, isSelected: boolean, onSelect: () => void }) {
  const config = STATUS_CONFIG[crew.status];

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl cursor-pointer transition-all border ${
        isSelected ? "bg-card-inner-selected" : "bg-card-inner hover:bg-card-inner-hover"
      }`}
      style={{
        borderColor: isSelected ? "var(--border-highlight)" : "var(--border-inner)",
        boxShadow: isSelected ? "0 0 16px rgba(227,239,38,0.15)" : "none",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-philosopher font-bold text-foreground text-lg">{crew.name}</h4>
        <span
          className="text-xs font-inter font-bold uppercase px-2 py-1 rounded"
          style={{ background: `${config.color}22`, color: config.color }}
        >
          {config.label}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter">
          <Truck className="w-4 h-4" />
          <span>{crew.vehicle.replace("_", " ")}</span>
        </div>
        {crew.currentAssignmentId ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter">
            <MapPin className="w-4 h-4" />
            <span>Assigned to: <span className="text-foreground font-jetbrains-mono">#{crew.currentAssignmentId.slice(-6).toUpperCase()}</span></span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-inter">
            <Users className="w-4 h-4" />
            <span>Awaiting dispatch</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 pt-3 border-t border-border">
        <div className="relative flex items-center justify-center w-4 h-4">
          <div className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ background: config.color }}></div>
          <div className="w-2 h-2 rounded-full relative z-10" style={{ background: config.color }}></div>
        </div>
        <span className="text-xs text-muted-foreground font-inter" suppressHydrationWarning>
          Location updated {formatDistanceToNow(new Date(crew.lastPing), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}

export function CrewList() {
  const { crews, selectedCrewId, selectCrew } = useCrewsStore();
  const { flyToComplaint } = useComplaintsStore();

  return (
    <div className="flex flex-col h-full glass-panel rounded-xl overflow-hidden hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <h3 className="font-philosopher font-semibold text-foreground text-lg">
          Active Crews
        </h3>
        <span className="text-xs font-inter text-muted-foreground bg-background px-2 py-1 rounded">
          {crews.length} online
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {crews.map((crew) => (
          <CrewCard
            key={crew.id}
            crew={crew}
            isSelected={selectedCrewId === crew.id}
            onSelect={() => {
              selectCrew(crew.id);
              flyToComplaint(crew.latitude, crew.longitude);
            }}
          />
        ))}
      </div>
    </div>
  );
}
