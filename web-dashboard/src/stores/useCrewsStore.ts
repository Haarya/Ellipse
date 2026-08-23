import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CrewStatus = "AVAILABLE" | "DISPATCHED" | "ON_SITE" | "RETURNING";

export interface FieldCrew {
  id: string;
  name: string;
  status: CrewStatus;
  latitude: number;
  longitude: number;
  vehicle: string;
  teamSize?: number;
  currentAssignmentId?: string;
  lastPing: string;
}

interface CrewsState {
  crews: FieldCrew[];
  selectedCrewId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchCrews: () => Promise<void>;
  setCrews: (crews: FieldCrew[]) => void;
  selectCrew: (id: string | null) => void;
  addCrew: (crewData: { name: string; vehicle: string; zone?: string; teamSize: number; latitude: number; longitude: number }) => Promise<void>;
  updateCrew: (id: string, updates: Partial<FieldCrew>) => void;
  deleteCrew: (id: string) => Promise<void>;
}

export const useCrewsStore = create<CrewsState>()(
  persist(
    (set) => ({
  crews: [],
  isLoading: false,
  error: null,
  selectedCrewId: null,
  fetchCrews: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("http://localhost:3000/api/v1/internal/crews", {
        headers: { "x-ai-service-secret": "ellipse-ai-webhook-secret-67890" }
      });
      if (!res.ok) throw new Error("Failed to fetch crews");
      const data = await res.json();
      
      set((state) => {
        // Merge fetched data with local state to preserve local status/location updates
        const mergedCrews = data.map((fetchedCrew: FieldCrew) => {
          const localCrew = state.crews.find(c => c.id === fetchedCrew.id);
          // If the crew was locally dispatched/on-site, preserve their status and assignment
          if (localCrew && localCrew.status !== 'AVAILABLE') {
            return {
              ...fetchedCrew,
              status: localCrew.status,
              latitude: localCrew.latitude,
              longitude: localCrew.longitude,
              currentAssignmentId: localCrew.currentAssignmentId
            };
          }
          return fetchedCrew;
        });
        
        return { crews: mergedCrews, isLoading: false };
      });
    } catch {
      set({ error: "Failed to fetch crews", isLoading: false });
    }
  },
  setCrews: (crews) => set({ crews }),
  selectCrew: (id) => set({ selectedCrewId: id }),
  addCrew: async (crewData: { name: string; vehicle: string; zone?: string; teamSize: number; latitude: number; longitude: number }) => {
    try {
      const res = await fetch("http://localhost:3000/api/v1/internal/crews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ai-service-secret": "ellipse-ai-webhook-secret-67890"
        },
        body: JSON.stringify(crewData)
      });
      if (!res.ok) throw new Error("Failed to add crew");
      const newCrew = await res.json();
      set((state) => ({ crews: [...state.crews, newCrew] }));
    } catch (error) {
      console.error("Failed to add crew", error);
    }
  },
  updateCrew: (id, updates) => set((state) => ({
    crews: state.crews.map(crew => crew.id === id ? { ...crew, ...updates } : crew)
  })),
  deleteCrew: async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/internal/crews/${id}`, {
        method: "DELETE",
        headers: {
          "x-ai-service-secret": "ellipse-ai-webhook-secret-67890"
        }
      });
      if (!res.ok) throw new Error("Failed to delete crew");
      set((state) => ({
        crews: state.crews.filter((c) => c.id !== id),
        selectedCrewId: state.selectedCrewId === id ? null : state.selectedCrewId
      }));
    } catch (error) {
      console.error("Failed to delete crew", error);
    }
  }
    }),
    {
      name: "ellipse-crews-storage", // name of the item in the storage (must be unique)
    }
  )
);
