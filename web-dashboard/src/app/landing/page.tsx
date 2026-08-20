"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Zap, FileText, Activity, HelpCircle } from "lucide-react";
import { useAuthStore, apiLogin } from "@/stores/useAuthStore";
import gsap from "gsap";

export default function LandingPage() {
  const router = useRouter();
  const { setSession } = useAuthStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    if (heroRef.current) {
      tl.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" }
      );
    }

    if (statsRef.current) {
      tl.fromTo(
        statsRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
        "-=0.4"
      );
    }

    if (noticeRef.current) {
      tl.fromTo(
        noticeRef.current,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );
    }
  }, []);

  const handleQuickAccess = async () => {
    try {
      const result = await apiLogin({ email: "admin@bbmc.gov.in", password: "admin123" });
      setSession(result.user, result.access_token);
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  const stats = [
    { label: "Active Complaints", value: "1,245", trend: "+12%", color: "#FF4D4D" },
    { label: "Resolution Rate", value: "84.2%", trend: "+2.1%", color: "#2ED573" },
    { label: "Active Crews", value: "128", trend: "On Duty", color: "#54A0FF" },
    { label: "Avg Response", value: "18.5h", trend: "-2h", color: "#E3EF26" },
  ];

  const announcements = [
    {
      id: 1,
      date: "Aug 20, 2026",
      category: "Policy",
      title: "New SWM zones effective immediately",
      desc: "Ward restructuring has been finalized. Please check the updated GIS boundaries on the map.",
      color: "#54A0FF"
    },
    {
      id: 2,
      date: "Aug 18, 2026",
      category: "System Update",
      title: "TOPSIS scoring model v2.1 deployed",
      desc: "Severity scoring now weights bio-hazardous waste 20% higher. Adjust triage filters accordingly.",
      color: "#2ED573"
    },
    {
      id: 3,
      date: "Aug 15, 2026",
      category: "Alert",
      title: "Monsoon SOP Activated",
      desc: "All field crews must prioritize clogged drain reports. PPE requirements updated.",
      color: "#FF9F43"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(7,102,83,0.15) 0%, transparent 60%)" }} />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(227,239,38,0.08) 0%, transparent 60%)" }} />
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-24 items-center">
        
        {/* Left Column: Hero & Stats */}
        <div className="space-y-10">
          <div className="space-y-6" ref={heroRef}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-inter font-medium text-primary uppercase tracking-wider">System Operational</span>
            </div>
            
            <div>
              <h1 className="text-5xl md:text-6xl font-philosopher font-bold text-accent-lime leading-tight mb-4">
                Ellipse<br/>
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #E3EF26 0%, #2ED573 100%)" }}>
                  Command Center
                </span>
              </h1>
              <p className="text-lg text-muted-foreground font-inter max-w-xl leading-relaxed">
                The centralized decision support system for municipal authorities. Monitor, triage, and dispatch resources using AI-powered geospatial intelligence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => router.push("/login")}
                className="px-6 py-3.5 rounded-xl font-inter font-bold text-sm transition-all flex items-center justify-center gap-2"
                style={{ background: "#076653", color: "#FFFFFF", border: "1px solid #0A8A72", boxShadow: "0 4px 20px rgba(7,102,83,0.3)" }}
              >
                Sign In with Credentials
                <ArrowRight className="w-4 h-4" />
              </button>
              
              {/* Prototype Bypass Button */}
              <button 
                onClick={handleQuickAccess}
                className="px-6 py-3.5 rounded-xl font-inter font-bold text-sm transition-all flex items-center justify-center gap-2 group"
                style={{ background: "rgba(227,239,38,0.1)", color: "#E3EF26", border: "1px dashed rgba(227,239,38,0.4)" }}
              >
                <Zap className="w-4 h-4 group-hover:fill-[#E3EF26] transition-all" />
                Quick Access (Prototype)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="text-xs font-inter text-muted-foreground">{s.label}</span>
                <span className="text-2xl font-jetbrains-mono font-bold" style={{ color: s.color }}>{s.value}</span>
                <span className="text-xs font-inter font-medium opacity-80" style={{ color: s.color }}>{s.trend}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Notice Board */}
        <div className="glass-panel rounded-2xl overflow-hidden hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1 shadow-2xl relative">
          <div className="p-5 border-b border-border-subtle bg-background/50 flex items-center gap-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-philosopher font-bold text-lg text-white">Department Circulars</h2>
          </div>
          
          <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
            {announcements.map((item) => (
              <div key={item.id} className="p-4 rounded-xl hover:bg-background/40 transition-colors group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className="text-[10px] font-jetbrains-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold"
                    style={{ background: `${item.color}20`, color: item.color }}
                  >
                    {item.category}
                  </span>
                  <span className="text-xs font-inter text-muted-foreground">{item.date}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground font-inter mb-1.5 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground font-inter leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border bg-background/50 flex justify-between gap-4">
            <button className="flex-1 py-2 rounded-lg bg-background border border-border text-xs font-inter font-medium hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              SWM Guidelines
            </button>
            <button className="flex-1 py-2 rounded-lg bg-background border border-border text-xs font-inter font-medium hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2">
              <HelpCircle className="w-3.5 h-3.5" />
              IT Support
            </button>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-surface/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-inter">
            Access restricted to authorized government personnel. For internal use only.
          </p>
        </div>
        <p className="text-xs text-muted-foreground font-jetbrains-mono opacity-50">
          GIGW Compliant • Build 2.1.4
        </p>
      </footer>
    </div>
  );
}
