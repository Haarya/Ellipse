"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Bell, AlertTriangle, AlertCircle, FileText, CheckCircle2, Megaphone } from "lucide-react";
import { useNotificationsStore, NotificationType } from "@/stores/useNotificationsStore";

interface Props {
  onClose: () => void;
}

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; bgColor: string }> = {
  COMPLAINT_NEW: { icon: Bell, color: "#E3EF26", bgColor: "rgba(227,239,38,0.15)" },
  SLA_BREACH: { icon: AlertTriangle, color: "#FF4D4D", bgColor: "rgba(255,77,77,0.15)" },
  DISPATCH_CONFIRMED: { icon: CheckCircle2, color: "#2ED573", bgColor: "rgba(46,213,115,0.15)" },
  DEDUP_DISPUTE: { icon: AlertCircle, color: "#FF9F43", bgColor: "rgba(255,159,67,0.15)" },
  SYSTEM_ANNOUNCEMENT: { icon: Megaphone, color: "#54A0FF", bgColor: "rgba(84,160,255,0.15)" },
  AI_TRIAGE_COMPLETE: { icon: FileText, color: "#FECA57", bgColor: "rgba(254,202,87,0.15)" },
};

function formatTimeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationsPanel({ onClose }: Props) {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead } = useNotificationsStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      router.push(link);
      onClose();
    }
  };

  return (
    <div 
      ref={panelRef}
      className="absolute top-16 right-6 w-96 max-h-[500px] flex flex-col rounded-xl overflow-hidden z-50"
      style={{
        background: "rgba(6,31,26,0.95)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
      }}
    >
      <div className="p-4 border-b border-border bg-background/50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-philosopher font-bold text-lg text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-jetbrains-mono font-bold" style={{ background: "rgba(227,239,38,0.2)", color: "#E3EF26" }}>
              {unreadCount} NEW
            </span>
          )}
        </div>
        <button 
          onClick={() => markAllAsRead()}
          className="text-xs font-inter flex items-center gap-1.5 transition-colors"
          style={{ color: "#B0B0B0" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#F0F0F0"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#B0B0B0"}
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark all read
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground font-inter">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((notif) => {
              const config = TYPE_CONFIG[notif.type];
              const Icon = config.icon;
              return (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id, notif.link)}
                  className="w-full text-left p-4 border-b border-border/50 hover:bg-surface/50 transition-colors flex gap-3 relative group"
                >
                  {/* Unread indicator */}
                  {!notif.read && (
                    <div className="absolute top-1/2 -translate-y-1/2 left-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}

                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ml-2"
                    style={{ background: config.bgColor, color: config.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p 
                        className={`text-sm font-inter font-medium leading-tight ${notif.read ? "text-muted-foreground" : "text-foreground group-hover:text-primary transition-colors"}`}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] font-inter text-muted-foreground whitespace-nowrap mt-0.5">
                        {formatTimeAgo(notif.timestamp)}
                      </span>
                    </div>
                    <p className={`text-xs font-inter line-clamp-2 ${notif.read ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
                      {notif.message}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
