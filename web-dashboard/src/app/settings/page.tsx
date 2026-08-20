"use client";

import { useState } from "react";
import { ShieldCheck, Clock, Users, Database, Server, Activity, Save } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [toastMsg, setToastMsg] = useState("");

  // Only ADMIN should access this page normally, but we render it if they somehow get here.
  // In a real app, middleware would block non-admins.
  if (user?.role !== "ADMIN") {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        <ShieldCheck className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-philosopher font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Only administrators can access system settings.</p>
        <button 
          onClick={() => router.push("/")}
          className="mt-6 px-4 py-2 bg-surface hover:bg-surface/80 rounded-lg text-sm font-inter transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-64px)] overflow-y-auto pb-8 pr-2 custom-scrollbar relative">
      {toastMsg && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-inter font-bold z-50 whitespace-nowrap shadow-xl">
          {toastMsg}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-philosopher font-bold text-foreground">System Settings</h2>
        <p className="text-sm text-muted-foreground font-inter">Configure SLA thresholds, manage wards, and monitor system health.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SLA Configuration */}
        <div className="glass-panel rounded-xl overflow-hidden flex flex-col hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
          <div className="p-5 border-b border-border-subtle bg-background/30 flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-sm font-inter font-semibold text-foreground">SLA Thresholds</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-inter text-muted-foreground">Critical Priority (Hours)</label>
              <input type="number" defaultValue={24} className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-inter text-muted-foreground">Standard Priority (Hours)</label>
              <input type="number" defaultValue={48} className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-inter text-muted-foreground">Low Priority (Hours)</label>
              <input type="number" defaultValue={72} className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
            </div>
            <button 
              onClick={() => showToast("SLA thresholds updated")}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors w-full sm:w-auto"
            >
              <Save className="w-4 h-4" />
              Save SLA Changes
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="glass-panel rounded-xl overflow-hidden flex flex-col hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
          <div className="p-5 border-b border-border-subtle bg-background/30 flex items-center gap-3">
            <Activity className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-sm font-inter font-semibold text-foreground">Service Health</h3>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            {[
              { label: "API Server", icon: Server, status: "Operational", uptime: "99.9%" },
              { label: "AI Pipeline", icon: Activity, status: "Operational", uptime: "99.8%" },
              { label: "Redis Queue", icon: Database, status: "Operational", uptime: "100%" },
              { label: "PostgreSQL", icon: Database, status: "Operational", uptime: "99.9%" },
            ].map((service, i) => (
              <div key={i} className="p-3 rounded-lg border border-border bg-background/50 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <service.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-inter font-medium text-foreground">{service.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] font-inter text-muted-foreground">{service.status}</span>
                  </div>
                  <span className="text-[10px] font-jetbrains-mono text-muted-foreground">{service.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ward Management (Read Only Mock) */}
        <div className="glass-panel rounded-xl overflow-hidden flex flex-col hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1 lg:col-span-2">
          <div className="p-5 border-b border-border-subtle bg-background/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-sm font-inter font-semibold text-foreground">Ward Management</h3>
            </div>
            <button className="text-xs font-inter text-primary hover:underline">Add New Ward</button>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-border/50 text-xs font-inter text-muted-foreground bg-background/50">
                  <th className="p-4 font-medium">Ward ID</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Assigned Officer</th>
                  <th className="p-4 font-medium">Active Crews</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-inter divide-y divide-border/50">
                {[
                  { id: "W-42", name: "Andheri West", officer: "Rajesh Patil", crews: 3 },
                  { id: "W-31", name: "Bandra East", officer: "Priya Sharma", crews: 2 },
                  { id: "W-14", name: "Dadar", officer: "Amit Kumar", crews: 4 },
                ].map((ward, i) => (
                  <tr key={i} className="hover:bg-background/20 transition-colors">
                    <td className="p-4 font-jetbrains-mono text-foreground">{ward.id}</td>
                    <td className="p-4 text-foreground">{ward.name}</td>
                    <td className="p-4 text-muted-foreground">{ward.officer}</td>
                    <td className="p-4 text-muted-foreground">{ward.crews}</td>
                    <td className="p-4 text-right">
                      <button className="text-xs text-primary hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div className="mt-4 p-4 rounded-xl flex items-center justify-between glass-panel hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1">
        <div className="flex flex-col">
          <span className="text-sm font-inter font-semibold text-foreground">Ellipse Authority Command Center</span>
          <span className="text-xs font-jetbrains-mono text-muted-foreground mt-1">Version 2.1.4 • Build 8f72a9b • Environment: Development</span>
        </div>
        <ShieldCheck className="w-8 h-8 text-muted-foreground opacity-30" />
      </div>
    </div>
  );
}
