import { create } from "zustand";

export type CrewStatus = "AVAILABLE" | "DISPATCHED" | "ON_SITE" | "RETURNING";

export interface FieldCrew {
  id: string;
  name: string;
  status: CrewStatus;
  latitude: number;
  longitude: number;
  vehicle: string;
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
  addCrew: (crewData: { name: string; vehicle: string; zone: string }) => Promise<void>;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const useCrewsStore = create<CrewsState>((set) => ({
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
      set({ crews: data, isLoading: false });
    } catch {
      set({ error: "Failed to fetch crews", isLoading: false });
    }
  },
  setCrews: (crews) => set({ crews }),
  selectCrew: (id) => set({ selectedCrewId: id }),
  addCrew: async (crewData: { name: string; vehicle: string; zone: string }) => {
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
  }
}));
