"use client";

import { useState } from "react";
import { useCrewsStore } from "@/stores/useCrewsStore";

interface CreateCrewModalProps {
  onClose: () => void;
}

export function CreateCrewModal({ onClose }: CreateCrewModalProps) {
  const [newCrew, setNewCrew] = useState({ name: "", vehicle: "MINI_TRUCK", teamSize: 2 });
  const { addCrew } = useCrewsStore();

  const handleAddCrew = async () => {
    if (!newCrew.name) return;
    
    const defaultCoords = { lat: 19.076, lng: 72.8777 }; // Central Mumbai

    await addCrew({
      name: newCrew.name,
      vehicle: newCrew.vehicle,
      teamSize: newCrew.teamSize,
      latitude: defaultCoords.lat,
      longitude: defaultCoords.lng,
    });
    
    onClose();
  };

  return (
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
        
        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground">Team Size</label>
          <input 
            type="number"
            min="1"
            max="10"
            value={newCrew.teamSize}
            onChange={(e) => setNewCrew({ ...newCrew, teamSize: parseInt(e.target.value) || 2 })}
            className="bg-surface border border-border p-2 rounded-lg text-sm text-foreground focus:outline-none focus:border-accent-lime"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-surface-subtle"
          >
            Cancel
          </button>
          <button 
            onClick={handleAddCrew}
            disabled={!newCrew.name}
            className="bg-accent-lime text-background px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            Create Team
          </button>
        </div>
      </div>
    </div>
  );
}
