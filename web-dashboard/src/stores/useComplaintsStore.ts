import { create } from "zustand";

export type WasteClass =
  | "Recyclables"
  | "Organic"
  | "C&D"
  | "Hazardous"
  | "Bulk Dump";

export type ComplaintStatus =
  | "LOGGED"
  | "AI_TRIAGED"
  | "ASSIGNED"
  | "DISPATCHED"
  | "RESOLVED"
  | "DUPLICATE"
  | "REJECTED";

export type LogisticsTier = 1 | 2 | 3 | 4;

export interface AiAnalysis {
  wasteClasses: WasteClass[];
  volumeM3: number | null;
  volumeConfidence: "HIGH" | "MEDIUM" | "LOW";
  severityScore: number;
  hazardFlags: string[];
  logisticsTier: LogisticsTier;
}

export interface Complaint {
  id: string;
  rawImageUrl: string;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
  upvoteCount: number;
  createdAt: string;
  aiAnalysis: AiAnalysis | null;
  parent_complaint_id?: string;
  dedup_similarity?: number;
  dedup_disputed?: boolean;
}

interface ComplaintsState {
  complaints: Complaint[];
  selectedComplaintId: string | null;
  selectedDedupReviewId: string | null;
  mapViewport: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  isLoading: boolean;
  error: string | null;
  fetchComplaints: () => Promise<void>;
  setComplaints: (complaints: Complaint[]) => void;
  addComplaint: (complaint: Complaint) => void;
  selectComplaint: (id: string | null) => void;
  selectDedupReview: (id: string | null) => void;
  flyToComplaint: (latitude: number, longitude: number) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => Promise<void>;
  resolveDedup: (id: string, resolution: "MERGE" | "SEPARATE") => Promise<void>;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock complaints seeded around Mumbai for demo purposes
const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "comp-001",
    rawImageUrl: "https://picsum.photos/seed/waste1/400/300",
    latitude: 19.076,
    longitude: 72.8777,
    status: "AI_TRIAGED",
    upvoteCount: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    aiAnalysis: {
      wasteClasses: ["Hazardous", "Recyclables"],
      volumeM3: 2.1,
      volumeConfidence: "LOW",
      severityScore: 0.89,
      hazardFlags: ["Bio-Hazard", "E-Waste"],
      logisticsTier: 3,
    },
  },
  {
    id: "comp-002",
    rawImageUrl: "https://picsum.photos/seed/waste2/400/300",
    latitude: 19.082,
    longitude: 72.883,
    status: "AI_TRIAGED",
    upvoteCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    aiAnalysis: {
      wasteClasses: ["Organic", "Bulk Dump"],
      volumeM3: 4.5,
      volumeConfidence: "LOW",
      severityScore: 0.65,
      hazardFlags: [],
      logisticsTier: 4,
    },
  },
  {
    id: "comp-003",
    rawImageUrl: "https://picsum.photos/seed/waste3/400/300",
    latitude: 19.071,
    longitude: 72.872,
    status: "LOGGED",
    upvoteCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    aiAnalysis: null,
  },
  {
    id: "comp-004",
    rawImageUrl: "https://picsum.photos/seed/waste4/400/300",
    latitude: 19.088,
    longitude: 72.869,
    status: "AI_TRIAGED",
    upvoteCount: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    aiAnalysis: {
      wasteClasses: ["C&D"],
      volumeM3: 1.2,
      volumeConfidence: "LOW",
      severityScore: 0.42,
      hazardFlags: [],
      logisticsTier: 2,
    },
  },
  {
    id: "comp-005",
    rawImageUrl: "https://picsum.photos/seed/waste5/400/300",
    latitude: 19.065,
    longitude: 72.891,
    status: "DISPATCHED",
    upvoteCount: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    aiAnalysis: {
      wasteClasses: ["Recyclables"],
      volumeM3: 0.4,
      volumeConfidence: "LOW",
      severityScore: 0.28,
      hazardFlags: [],
      logisticsTier: 1,
    },
  },
  {
    id: "comp-006-dedup",
    rawImageUrl: "https://picsum.photos/seed/waste6/400/300",
    latitude: 19.0762,
    longitude: 72.8779, // Just 30m away from comp-001
    status: "LOGGED",
    upvoteCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    parent_complaint_id: "comp-001",
    dedup_similarity: 0.82, // High similarity, AI flagged for review
    dedup_disputed: false,
    aiAnalysis: {
      wasteClasses: ["Hazardous", "Recyclables"],
      volumeM3: 2.3,
      volumeConfidence: "LOW",
      severityScore: 0.88,
      hazardFlags: ["Bio-Hazard"],
      logisticsTier: 3,
    },
  },
  {
    id: "comp-007-dispute",
    rawImageUrl: "https://picsum.photos/seed/waste7/400/300",
    latitude: 19.0825,
    longitude: 72.8831,
    status: "LOGGED",
    upvoteCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    parent_complaint_id: "comp-002",
    dedup_similarity: 0.94, // AI auto-merged it
    dedup_disputed: true, // But citizen disputed the merge
    aiAnalysis: {
      wasteClasses: ["Organic"],
      volumeM3: 1.1,
      volumeConfidence: "LOW",
      severityScore: 0.35,
      hazardFlags: [],
      logisticsTier: 2,
    },
  },
];

export const useComplaintsStore = create<ComplaintsState>((set) => ({
  complaints: MOCK_COMPLAINTS,
  isLoading: false,
  error: null,
  selectedComplaintId: null,
  selectedDedupReviewId: null,
  mapViewport: {
    longitude: 72.8777,
    latitude: 19.076,
    zoom: 13,
  },
  fetchComplaints: async () => {
    set({ isLoading: true, error: null });
    try {
      await delay(600); // Simulate API call
      set({ complaints: MOCK_COMPLAINTS, isLoading: false });
    } catch {
      set({ error: "Failed to fetch complaints", isLoading: false });
    }
  },
  setComplaints: (complaints) => set({ complaints }),
  addComplaint: (complaint) =>
    set((state) => ({ complaints: [complaint, ...state.complaints] })),
  selectComplaint: (id) => set({ selectedComplaintId: id }),
  selectDedupReview: (id) => set({ selectedDedupReviewId: id }),
  flyToComplaint: (latitude, longitude) =>
    set({ mapViewport: { latitude, longitude, zoom: 15 } }),
  updateComplaintStatus: async (id, status) => {
    try {
      await delay(400); // Simulate API call
      set((state) => ({
        complaints: state.complaints.map((c) =>
          c.id === id ? { ...c, status } : c
        ),
      }));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  },
  resolveDedup: async (id, resolution) => {
    try {
      await delay(500); // Simulate API call
      set((state) => ({
        selectedDedupReviewId: state.selectedDedupReviewId === id ? null : state.selectedDedupReviewId,
        complaints: state.complaints.map((c) => {
          if (c.id === id) {
            if (resolution === "MERGE") {
              return { ...c, status: "DUPLICATE" };
            } else {
              return { ...c, parent_complaint_id: undefined, status: "AI_TRIAGED" };
            }
          }
          return c;
        }),
      }));
    } catch (err) {
      console.error("Failed to resolve dedup", err);
    }
  }
}));
