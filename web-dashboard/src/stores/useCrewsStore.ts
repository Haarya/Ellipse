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
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_CREWS: FieldCrew[] = [
  {
    id: "crew-001",
    name: "Team Alpha (Andheri)",
    status: "AVAILABLE",
    latitude: 19.1136,
    longitude: 72.8697,
    vehicle: "COMPACTOR",
    lastPing: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: "crew-002",
    name: "Team Bravo (Bandra)",
    status: "DISPATCHED",
    latitude: 19.062,
    longitude: 72.835,
    vehicle: "MINI_TRUCK",
    currentAssignmentId: "comp-005",
    lastPing: new Date(Date.now() - 1000 * 45).toISOString(),
  },
  {
    id: "crew-003",
    name: "Team Charlie (Dadar)",
    status: "ON_SITE",
    latitude: 19.0213,
    longitude: 72.8424,
    vehicle: "HANDCART",
    currentAssignmentId: "comp-003",
    lastPing: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "crew-004",
    name: "Team Delta (Sion)",
    status: "RETURNING",
    latitude: 19.039,
    longitude: 72.8619,
    vehicle: "MINI_TRUCK",
    lastPing: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
  },
];

export const useCrewsStore = create<CrewsState>((set) => ({
  crews: MOCK_CREWS,
  isLoading: false,
  error: null,
  selectedCrewId: null,
  fetchCrews: async () => {
    set({ isLoading: true, error: null });
    try {
      await delay(500); // Simulate API call
      set({ crews: MOCK_CREWS, isLoading: false });
    } catch {
      set({ error: "Failed to fetch crews", isLoading: false });
    }
  },
  setCrews: (crews) => set({ crews }),
  selectCrew: (id) => set({ selectedCrewId: id }),
}));
