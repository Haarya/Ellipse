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

const INITIAL_STATE = {
  stats: {
    totalComplaintsThisMonth: 0,
    resolutionRate: 0,
    avgResponseTimeHours: 0,
    slaComplianceRate: 0,
    activeHotspots: 0,
  },
  complaintsTrend: [],
  wasteDistribution: [],
  wardPerformance: [],
  severityBreakdown: [],
};

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  ...INITIAL_STATE,
  isLoading: false,
  error: null,
  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("http://localhost:3000/api/v1/internal/complaints/analytics/overview", {
        headers: { "x-ai-service-secret": "ellipse-ai-webhook-secret-67890" }
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      set({ 
        stats: data.stats,
        complaintsTrend: data.complaintsTrend,
        wasteDistribution: data.wasteDistribution,
        wardPerformance: data.wardPerformance,
        severityBreakdown: data.severityBreakdown,
        isLoading: false 
      });
    } catch {
      set({ error: "Failed to fetch analytics", isLoading: false });
    }
  }
}));
