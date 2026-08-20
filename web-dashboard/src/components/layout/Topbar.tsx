"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Users, FileText, X } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationsStore } from "@/stores/useNotificationsStore";
import { NotificationsPanel } from "@/components/layout/NotificationsPanel";
import { ProfilePanel } from "@/components/layout/ProfilePanel";

export function Topbar() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { notifications } = useNotificationsStore();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "AU";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearching(e.target.value.length > 0);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  const handleSelectResult = (path: string) => {
    router.push(path);
    clearSearch();
  };

  // Mock search results filtering
  const complaintResults = searchQuery.length > 1 
    ? [
        { id: "comp-001", title: "Hazardous Waste", detail: "Andheri West (Ward 42)" },
        { id: "comp-004", title: "C&D Dump", detail: "Sion (Ward 22)" }
      ].filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.includes(searchQuery) || r.detail.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const crewResults = searchQuery.length > 1 
    ? [
        { id: "crew-001", name: "Team Alpha", location: "Andheri West" },
        { id: "crew-002", name: "Team Bravo", location: "Bandra East" }
      ].filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.location.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const hasResults = complaintResults.length > 0 || crewResults.length > 0;

  return (
    <header className="relative h-16 border-b border-border bg-background flex items-center justify-between px-6 flex-shrink-0 z-40">
      <div className="flex-1 max-w-xl relative" ref={searchRef}>
        <div 
          className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-md border transition-colors relative z-50"
          style={{ borderColor: isSearching ? "var(--accent-lime)" : "var(--border)" }}
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => { if (searchQuery.length > 0) setIsSearching(true); }}
            placeholder="Search complaints, crews, or locations..."
            className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground font-inter"
          />
          {searchQuery && (
            <button onClick={clearSearch} className="p-0.5 rounded-full hover:bg-background transition-colors text-muted-foreground">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Search Dropdown */}
        {isSearching && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden shadow-2xl flex flex-col z-50 glass-panel"
          >
            {hasResults ? (
              <div className="max-h-[400px] overflow-y-auto p-2 flex flex-col gap-4">
                {complaintResults.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-inter font-bold text-muted-foreground uppercase tracking-wider px-3 mb-1">Complaints</h4>
                    {complaintResults.map(r => (
                      <button 
                        key={r.id} 
                        onClick={() => handleSelectResult(`/triage?id=${r.id}`)}
                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-subtle transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex flex-col items-center justify-center flex-shrink-0 group-hover:border-primary/50 transition-colors">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-inter text-foreground group-hover:text-primary transition-colors">{r.id} • {r.title}</span>
                          <span className="text-xs font-inter text-muted-foreground">{r.detail}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {crewResults.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-inter font-bold text-muted-foreground uppercase tracking-wider px-3 mb-1">Field Crews</h4>
                    {crewResults.map(r => (
                      <button 
                        key={r.id} 
                        onClick={() => handleSelectResult(`/crews?id=${r.id}`)}
                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-subtle transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex flex-col items-center justify-center flex-shrink-0 group-hover:border-accent/50 transition-colors">
                          <Users className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-inter text-foreground group-hover:text-accent transition-colors">{r.name}</span>
                          <span className="text-xs font-inter text-muted-foreground">{r.location}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center justify-center text-center">
                <Search className="w-6 h-6 text-muted-foreground opacity-50 mb-2" />
                <p className="text-sm text-foreground font-inter">No results found</p>
                <p className="text-xs text-muted-foreground font-inter">Try searching for &quot;Andheri&quot;, &quot;Hazardous&quot;, or &quot;Team Alpha&quot;</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-surface transition-colors" 
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <NotificationsPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 border-l border-border pl-4 hover:opacity-80 transition-opacity text-left"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-inter flex-shrink-0"
              style={{ background: "#134A3E", color: "#E3EF26", border: "1px solid rgba(227,239,38,0.3)" }}
            >
              {initials}
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-sm font-medium font-inter text-foreground">
                {user?.name ?? "Authority User"}
              </span>
              <span className="text-xs text-muted-foreground font-inter">
                {user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : "Dispatcher"}
              </span>
            </div>
          </button>
          
          {showProfile && (
            <ProfilePanel onClose={() => setShowProfile(false)} />
          )}
        </div>
      </div>
    </header>
  );
}
