"use client";

import { useState } from "react";
import { X, Truck, Shield, User } from "lucide-react";
import { useComplaintsStore, LogisticsTier } from "@/stores/useComplaintsStore";

const VEHICLE_OPTIONS: { value: string; label: string; tier: LogisticsTier[] }[] = [
  { value: "MANUAL_SWEEP", label: "Manual Sweep Team", tier: [1] },
  { value: "HANDCART", label: "Handcart & Crew", tier: [2] },
  { value: "MINI_TRUCK", label: "Mini Truck", tier: [3] },
  { value: "COMPACTOR", label: "Heavy Compactor", tier: [4] },
];

const PPE_OPTIONS = ["Gloves", "Mask", "Boots", "Hazmat Suit", "Safety Vest"];

const MOCK_CREWS = [
  { id: "crew-001", name: "Alpha Squad", available: true },
  { id: "crew-002", name: "Beta Unit", available: true },
  { id: "crew-003", name: "Gamma Team", available: false },
];

interface DispatchModalProps {
  complaintId: string;
  onClose: () => void;
}

export function DispatchModal({ complaintId, onClose }: DispatchModalProps) {
  const { complaints, updateComplaintStatus } = useComplaintsStore();
  const complaint = complaints.find((c) => c.id === complaintId);

  const [selectedVehicle, setSelectedVehicle] = useState<string>(
    complaint?.aiAnalysis?.logisticsTier
      ? VEHICLE_OPTIONS.find((v) =>
          v.tier.includes(complaint.aiAnalysis!.logisticsTier)
        )?.value ?? "HANDCART"
      : "HANDCART"
  );
  const [selectedCrew, setSelectedCrew] = useState<string>("");
  const [selectedPPE, setSelectedPPE] = useState<string[]>(
    complaint?.aiAnalysis?.hazardFlags?.length ? ["Gloves", "Mask"] : []
  );
  const [isDispatching, setIsDispatching] = useState(false);

  if (!complaint) return null;

  const togglePPE = (item: string) => {
    setSelectedPPE((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  };

  const handleDispatch = async () => {
    if (!selectedCrew) return;
    setIsDispatching(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    updateComplaintStatus(complaintId, "DISPATCHED");
    setIsDispatching(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl border border-border-highlight bg-card-inner-hover p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <h2 className="text-xl font-philosopher font-bold text-foreground mb-1">
          Dispatch Crew
        </h2>
        <p className="text-sm text-muted-foreground font-inter mb-6">
          Complaint{" "}
          <span className="font-jetbrains-mono text-primary">
            #{complaintId.slice(-6).toUpperCase()}
          </span>{" "}
          · AI Severity:{" "}
          <span className="font-semibold text-foreground">
            {complaint.aiAnalysis
              ? (complaint.aiAnalysis.severityScore * 100).toFixed(0) + "%"
              : "N/A"}
          </span>
        </p>

        {/* Vehicle selection */}
        <div className="mb-5">
          <label className="flex items-center gap-2 text-xs text-muted-foreground font-inter uppercase tracking-wider mb-2">
            <Truck className="w-3 h-3" /> Vehicle Class
          </label>
          <div className="grid grid-cols-2 gap-2">
            {VEHICLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedVehicle(opt.value)}
                className={`p-3 rounded-lg border text-left transition-all font-inter text-sm ${
                  selectedVehicle === opt.value
                    ? "bg-card-inner-selected border-border-highlight text-accent-lime font-semibold"
                    : "bg-card-inner border-border-inner text-text-primary hover:bg-card-inner-hover"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Crew selection */}
        <div className="mb-5">
          <label className="flex items-center gap-2 text-xs text-muted-foreground font-inter uppercase tracking-wider mb-2">
            <User className="w-3 h-3" /> Assign Field Crew
          </label>
          <div className="space-y-2">
            {MOCK_CREWS.map((crew) => (
              <button
                key={crew.id}
                onClick={() => crew.available && setSelectedCrew(crew.id)}
                disabled={!crew.available}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border transition-all font-inter text-sm ${
                  selectedCrew === crew.id
                    ? "bg-card-inner-selected border-border-highlight text-accent-lime font-semibold"
                    : "bg-card-inner border-border-inner text-text-primary hover:bg-card-inner-hover"
                }`}
                style={{ opacity: !crew.available ? 0.5 : 1 }}
              >
                <span>{crew.name}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: crew.available
                      ? "rgba(46,213,115,0.15)"
                      : "rgba(176,176,176,0.15)",
                    color: crew.available ? "#2ED573" : "#B0B0B0",
                  }}
                >
                  {crew.available ? "Available" : "Busy"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* PPE selection */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-xs text-muted-foreground font-inter uppercase tracking-wider mb-2">
            <Shield className="w-3 h-3" /> PPE Requirements
          </label>
          <div className="flex flex-wrap gap-2">
            {PPE_OPTIONS.map((item) => (
              <button
                key={item}
                onClick={() => togglePPE(item)}
                className={`px-3 py-1.5 rounded-md text-xs font-inter border transition-all ${
                  selectedPPE.includes(item)
                    ? "bg-card-inner-selected border-border-highlight text-accent-lime font-semibold"
                    : "bg-card-inner border-border-inner text-text-primary hover:bg-card-inner-hover"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-inter text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDispatch}
            disabled={!selectedCrew || isDispatching}
            className="flex-1 py-3 rounded-xl text-sm font-inter font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-abyssal-dark bg-accent-lime hover:bg-accent-lime/90"
          >
            {isDispatching ? "Dispatching..." : "Confirm Dispatch"}
          </button>
        </div>
      </div>
    </div>
  );
}
