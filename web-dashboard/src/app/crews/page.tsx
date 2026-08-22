"use client";

import dynamic from "next/dynamic";
import { CrewList } from "@/components/crews/CrewList";

import { useState } from "react";
import { useCrewsStore } from "@/stores/useCrewsStore";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCrew, setNewCrew] = useState({ name: "", vehicle: "MINI_TRUCK", zone: "" });
  const { addCrew } = useCrewsStore();

  const handleAddCrew = async () => {
    if (!newCrew.name) return;
    await addCrew(newCrew);
    setIsModalOpen(false);
    setNewCrew({ name: "", vehicle: "MINI_TRUCK", zone: "" });
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col gap-4 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-philosopher font-bold text-foreground">
            Field Crews
          </h2>
          <p className="text-sm text-muted-foreground font-inter">
            Live operational roster and GPS tracking for active cleanup teams.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent-lime text-background px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          + Add Team
        </button>
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

      {isModalOpen && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass-panel-elevated p-6 rounded-2xl w-full max-w-md border border-border flex flex-col gap-4">
            <h3 className="text-xl font-philosopher font-bold">Add New Team</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">Team Name</label>
              <input 
                type="text" 
                value={newCrew.name}
                onChange={(e) => setNewCrew({ ...newCrew, name: e.target.value })}
                className="bg-surface border border-border p-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-lime"
                placeholder="e.g. Team Echo (Bandra)"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">Vehicle Type</label>
              <select 
                value={newCrew.vehicle}
                onChange={(e) => setNewCrew({ ...newCrew, vehicle: e.target.value })}
                className="bg-surface border border-border p-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-lime"
              >
                <option value="MINI_TRUCK">Mini Truck</option>
                <option value="COMPACTOR">Compactor</option>
                <option value="HANDCART">Handcart</option>
                <option value="MANUAL_SWEEP">Manual Sweep</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-surface-subtle"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCrew}
                className="bg-accent-lime text-background px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
