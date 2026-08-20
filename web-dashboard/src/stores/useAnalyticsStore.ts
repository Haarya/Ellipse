import { create } from "zustand";

export interface AnalyticsStats {
  totalComplaintsThisMonth: number;
  resolutionRate: number; // percentage
  avgResponseTimeHours: number;
  slaComplianceRate: number; // percentage
  activeHotspots: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface WardPerformance {
  ward: string;
  resolutionRate: number;
  total: number;
}

interface AnalyticsState {
  stats: AnalyticsStats;
  complaintsTrend: ChartDataPoint[]; // e.g., last 7 days
  wasteDistribution: ChartDataPoint[];
  wardPerformance: WardPerformance[];
  severityBreakdown: ChartDataPoint[];
  isLoading: boolean;
  error: string | null;
  fetchAnalytics: () => Promise<void>;
}

// Simulated backend delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_STATE = {
  stats: {
    totalComplaintsThisMonth: 1245,
    resolutionRate: 84.2,
    avgResponseTimeHours: 18.5,
    slaComplianceRate: 92.4,
    activeHotspots: 14,
  },
  complaintsTrend: [
    { label: "Mon", value: 142 },
    { label: "Tue", value: 156 },
    { label: "Wed", value: 138 },
    { label: "Thu", value: 165 },
    { label: "Fri", value: 189 },
    { label: "Sat", value: 214 },
    { label: "Sun", value: 238 },
  ],
  wasteDistribution: [
    { label: "Organic", value: 45, color: "#2ED573" },
    { label: "Recyclables", value: 25, color: "#54A0FF" },
    { label: "C&D", value: 15, color: "#FECA57" },
    { label: "Hazardous", value: 5, color: "#FF4D4D" },
    { label: "Bulk Dump", value: 10, color: "#FF9F43" },
  ],
  wardPerformance: [
    { ward: "Ward 42 — Andheri W", resolutionRate: 94, total: 210 },
    { ward: "Ward 31 — Bandra E", resolutionRate: 88, total: 185 },
    { ward: "Ward 14 — Dadar", resolutionRate: 82, total: 156 },
    { ward: "Ward 55 — Borivali", resolutionRate: 76, total: 198 },
    { ward: "Ward 22 — Sion", resolutionRate: 68, total: 245 },
  ],
  severityBreakdown: [
    { label: "Critical", value: 15, color: "#FF4D4D" },
    { label: "Moderate", value: 35, color: "#FF9F43" },
    { label: "Low", value: 50, color: "#FECA57" },
  ],
};

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  ...MOCK_STATE,
  isLoading: false,
  error: null,
  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      await delay(800); // Simulate network
      // In a real app: const data = await api.get('/analytics');
      set({ ...MOCK_STATE, isLoading: false });
    } catch {
      set({ error: "Failed to fetch analytics", isLoading: false });
    }
  }
}));
