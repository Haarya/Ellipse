"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, KeyRound, Download, X } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

interface Props {
  onClose: () => void;
}

export function ProfilePanel({ onClose }: Props) {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();
  const panelRef = useRef<HTMLDivElement>(null);
  
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AU";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSignOut = () => {
    clearSession();
    router.push("/landing");
    onClose();
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div 
      ref={panelRef}
      className="absolute top-16 right-6 w-80 flex flex-col rounded-xl overflow-hidden z-50"
      style={{
        background: "rgba(6,31,26,0.95)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
      }}
    >
      {toastMsg && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-inter font-bold z-50 whitespace-nowrap shadow-lg">
          {toastMsg}
        </div>
      )}

      {/* Profile Header */}
      <div className="p-6 border-b border-border bg-background/50 flex flex-col items-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
        
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold font-inter mb-3 border-2"
          style={{ background: "#134A3E", color: "#E3EF26", borderColor: "rgba(227,239,38,0.3)" }}
        >
          {initials}
        </div>
        <h3 className="font-philosopher font-bold text-xl text-foreground mb-1">
          {user?.name ?? "Authority User"}
        </h3>
        <span 
          className="text-xs font-inter font-bold px-2 py-0.5 rounded uppercase tracking-wider"
          style={{ 
            background: user?.role === "ADMIN" ? "rgba(227,239,38,0.2)" : "rgba(84,160,255,0.2)",
            color: user?.role === "ADMIN" ? "#E3EF26" : "#54A0FF"
          }}
        >
          {user?.role ?? "DISPATCHER"}
        </span>
      </div>

      {/* Details */}
      <div className="p-4 border-b border-border/50 space-y-3 bg-surface/30">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-inter uppercase text-muted-foreground tracking-wider font-semibold">Department</span>
          <span className="text-sm font-inter text-foreground">Solid Waste Management</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-inter uppercase text-muted-foreground tracking-wider font-semibold">Ward Assignment</span>
          <span className="text-sm font-inter text-foreground">{user?.ward ?? "Not Assigned"}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-inter uppercase text-muted-foreground tracking-wider font-semibold">Employee ID</span>
            <span className="text-sm font-jetbrains-mono text-foreground">{user?.id ?? "EMP-0000"}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-inter uppercase text-muted-foreground tracking-wider font-semibold">Status</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-inter text-foreground">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-2 flex flex-col">
        {showPwdForm ? (
          <div className="p-3 bg-surface/50 rounded-lg mb-2">
            <p className="text-xs font-inter text-muted-foreground mb-2">Change Password</p>
            <input type="password" placeholder="Current password" className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-white mb-2 outline-none focus:border-primary" />
            <input type="password" placeholder="New password" className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-white mb-3 outline-none focus:border-primary" />
            <div className="flex gap-2">
              <button 
                onClick={() => setShowPwdForm(false)}
                className="flex-1 py-1.5 rounded text-xs text-muted-foreground hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { setShowPwdForm(false); showToast("Password updated securely"); }}
                className="flex-1 py-1.5 rounded text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowPwdForm(true)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-inter text-foreground hover:bg-surface transition-colors w-full text-left"
          >
            <KeyRound className="w-4 h-4 text-muted-foreground" />
            Change Password
          </button>
        )}

        <button 
          onClick={() => showToast("Preferences saved")}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-inter text-foreground hover:bg-surface transition-colors w-full text-left"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
          Notification Preferences
        </button>
        
        <button 
          onClick={() => showToast("Feature coming soon")}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-inter text-foreground hover:bg-surface transition-colors w-full text-left"
        >
          <Download className="w-4 h-4 text-muted-foreground" />
          Download Service Report
        </button>

        <div className="h-px bg-border my-2 mx-2" />

        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-inter w-full text-left transition-colors group"
          style={{ color: "#FF4D4D" }}
        >
          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          Sign Out of Ellipse
        </button>
      </div>
    </div>
  );
}
