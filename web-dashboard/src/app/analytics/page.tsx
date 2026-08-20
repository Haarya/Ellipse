"use client";

import { useEffect } from "react";
import { useAnalyticsStore } from "@/stores/useAnalyticsStore";
import { AlertCircle, TrendingUp, Clock, MapPin, Activity, Loader2 } from "lucide-react";

export default function AnalyticsPage() {
  const { stats, complaintsTrend, wasteDistribution, wardPerformance, severityBreakdown, isLoading, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const maxTrend = Math.max(...complaintsTrend.map(d => d.value));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-64px)] overflow-y-auto pb-8 pr-2 custom-scrollbar">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-philosopher font-bold text-foreground">Analytics Dashboard</h2>
        <p className="text-sm text-muted-foreground font-inter">Live performance metrics, SLA compliance, and trend analysis.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Complaints", value: stats.totalComplaintsThisMonth, icon: Activity, color: "text-foreground" },
          { label: "Resolution Rate", value: `${stats.resolutionRate}%`, icon: TrendingUp, color: "text-primary" },
          { label: "Avg Response Time", value: `${stats.avgResponseTimeHours}h`, icon: Clock, color: "text-accent" },
          { label: "SLA Compliance", value: `${stats.slaComplianceRate}%`, icon: AlertCircle, color: "text-secondary-foreground" },
          { label: "Active Hotspots", value: stats.activeHotspots, icon: MapPin, color: "text-destructive" },
        ].map((kpi, i) => (
          <div key={i} className="glass-panel rounded-xl p-4 flex flex-col gap-3 hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-inter font-medium text-muted-foreground">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color} opacity-80`} />
            </div>
            <span className="text-2xl font-jetbrains-mono font-bold text-foreground">{kpi.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (Bar) */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 flex flex-col hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
          <h3 className="text-sm font-inter font-semibold text-foreground mb-6">Complaints Trend (Last 7 Days)</h3>
          <div className="flex-1 flex items-end gap-2 sm:gap-6 min-h-[200px]">
            {complaintsTrend.map((point, i) => {
              const heightPct = (point.value / maxTrend) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full h-full flex flex-col justify-end">
                    <div 
                      className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all relative border-t border-primary/50"
                      style={{ height: `${heightPct}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-jetbrains-mono opacity-0 group-hover:opacity-100 transition-opacity bg-background px-1.5 py-0.5 rounded border border-border">
                        {point.value}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-inter text-muted-foreground">{point.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Breakdown (Horizontal Bar) */}
        <div className="glass-panel rounded-xl p-5 flex flex-col hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
          <h3 className="text-sm font-inter font-semibold text-foreground mb-6">Severity Breakdown</h3>
          <div className="flex flex-col gap-5 justify-center flex-1">
            {severityBreakdown.map((item, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-inter">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-jetbrains-mono font-medium">{item.value}%</span>
                </div>
                <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ward Performance Table */}
        <div className="glass-panel rounded-xl overflow-hidden flex flex-col hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
          <div className="p-5 border-b border-border bg-background/30">
            <h3 className="text-sm font-inter font-semibold text-foreground">Ward Performance (Resolution Rate)</h3>
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-xs font-inter text-muted-foreground bg-surface">
                  <th className="p-4 font-medium">Ward</th>
                  <th className="p-4 font-medium">Total Reports</th>
                  <th className="p-4 font-medium w-1/3">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="text-sm font-inter divide-y divide-border/50">
                {wardPerformance.map((ward, i) => (
                  <tr key={i} className="hover:bg-background/20 transition-colors">
                    <td className="p-4 font-medium text-foreground">{ward.ward}</td>
                    <td className="p-4 font-jetbrains-mono text-muted-foreground">{ward.total}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="font-jetbrains-mono w-8 text-right">{ward.resolutionRate}%</span>
                        <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${ward.resolutionRate}%`, 
                              backgroundColor: ward.resolutionRate > 90 ? "#2ED573" : ward.resolutionRate > 80 ? "#E3EF26" : "#FF9F43"
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Waste Distribution (CSS Donut approximation using stacked progress bars for now) */}
        <div className="glass-panel rounded-xl p-5 flex flex-col hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
          <h3 className="text-sm font-inter font-semibold text-foreground mb-6">Waste Type Distribution</h3>
          
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="w-full flex h-4 rounded-full overflow-hidden mb-2">
              {wasteDistribution.map((item, i) => (
                <div 
                  key={i} 
                  className="h-full" 
                  style={{ width: `${item.value}%`, backgroundColor: item.color }} 
                  title={`${item.label}: ${item.value}%`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {wasteDistribution.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-inter text-muted-foreground flex-1">{item.label}</span>
                  <span className="text-xs font-jetbrains-mono font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
