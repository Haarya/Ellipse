"use client";

import { useEffect } from "react";
import { useAnalyticsStore } from "@/stores/useAnalyticsStore";
import { AlertCircle, TrendingUp, Clock, MapPin, Activity, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AnalyticsPage() {
  const { stats, complaintsTrend, wasteDistribution, wardPerformance, severityBreakdown, isLoading, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Complaints", value: stats.totalComplaintsThisMonth, icon: Activity, color: "text-foreground" },
          { label: "Resolution Rate", value: `${stats.resolutionRate}%`, icon: TrendingUp, color: "text-primary" },
          { label: "Avg Response Time", value: `${stats.avgResponseTimeHours}h`, icon: Clock, color: "text-accent" },
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
        {/* Trend Chart (Line Graph) */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 flex flex-col hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
          <h3 className="text-sm font-inter font-semibold text-foreground mb-4">Complaints Trend (Last 7 Days)</h3>
          <div className="flex-1 min-h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={complaintsTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E3EF26" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#E3EF26" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#8b949e', fontFamily: 'Inter' }} 
                  dy={10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#061f1a', borderColor: '#2ED573', borderRadius: '8px', fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#E3EF26' }}
                  itemStyle={{ color: '#E3EF26' }}
                  labelStyle={{ color: '#8b949e', marginBottom: '4px' }}
                  formatter={(value: any) => [`${value} complaints`, '']}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#E3EF26" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  activeDot={{ r: 5, fill: '#134A3E', stroke: '#E3EF26', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
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

        {/* Waste Distribution (Horizontal Bars) */}
        <div className="glass-panel rounded-xl p-5 flex flex-col hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
          <h3 className="text-sm font-inter font-semibold text-foreground mb-6">Waste Type Distribution</h3>
          <div className="flex flex-col gap-5 justify-center flex-1">
            {wasteDistribution.map((item, i) => (
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
    </div>
  );
}
