"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Map, { Marker, Popup, NavigationControl, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useComplaintsStore, Complaint } from "@/stores/useComplaintsStore";
import { useCrewsStore, CrewStatus } from "@/stores/useCrewsStore";

function getSeverityColor(score: number | undefined): string {
  if (score === undefined) return "#54A0FF"; // LOGGED - info blue
  if (score >= 0.75) return "#FF4D4D"; // Critical
  if (score >= 0.5) return "#FF9F43"; // Moderate
  return "#FECA57"; // Low
}

function getSeverityLabel(score: number | undefined): string {
  if (score === undefined) return "LOGGED";
  if (score >= 0.75) return "CRITICAL";
  if (score >= 0.5) return "MODERATE";
  return "LOW";
}

const CREW_COLORS: Record<CrewStatus, string> = {
  AVAILABLE: "#2ED573",
  DISPATCHED: "#FF9F43",
  ON_SITE: "#54A0FF",
  RETURNING: "#E3EF26",
};

export function IncidentMap({ showCrews = false }: { showCrews?: boolean } = {}) {
  const mapStyle = useMemo(() => {
    const baseUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png";

    return {
      version: 8 as const,
      sources: {
        carto_base: {
          type: "raster",
          tiles: [
            baseUrl.replace("{s}", "a"),
            baseUrl.replace("{s}", "b"),
            baseUrl.replace("{s}", "c"),
            baseUrl.replace("{s}", "d"),
          ],
          tileSize: 256,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
      },
      layers: [
        {
          id: "carto_base_layer",
          type: "raster",
          source: "carto_base",
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    };
  }, []);

  const { complaints, selectedComplaintId, mapViewport, selectComplaint, flyToComplaint } =
    useComplaintsStore();

  const [hoverInfo, setHoverInfo] = useState<Complaint | null>(null);
  const mapRef = useRef<MapRef>(null);
  const { crews, selectedCrewId, selectCrew } = useCrewsStore();

  // Imperatively fly the map when the global viewport store changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [mapViewport.longitude, mapViewport.latitude],
        zoom: mapViewport.zoom,
        duration: 1200,
      });
    }
  }, [mapViewport]);

  // Define markers declaratively
  const markers = useMemo(
    () =>
      complaints.map((complaint) => {
        const isSelected = complaint.id === selectedComplaintId;
        const color = getSeverityColor(complaint.aiAnalysis?.severityScore);
        const label = getSeverityLabel(complaint.aiAnalysis?.severityScore);

        return (
          <Marker
            key={complaint.id}
            longitude={complaint.longitude}
            latitude={complaint.latitude}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              selectComplaint(complaint.id);
              flyToComplaint(complaint.latitude, complaint.longitude);
            }}
          >
            <div
              onMouseEnter={() => setHoverInfo(complaint)}
              onMouseLeave={() => setHoverInfo(null)}
              style={{
                width: isSelected ? "48px" : "36px",
                height: isSelected ? "48px" : "36px",
                borderRadius: "50%",
                background: `${color}22`,
                border: `1.5px solid ${color}`,
                boxShadow: `0 0 ${isSelected ? "24px" : "12px"} ${color}aa`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isSelected ? "11px" : "9px",
                fontWeight: 800,
                fontFamily: "Inter, sans-serif",
                color: "#FFFFFF",
                letterSpacing: "0.5px",
                textShadow: "0px 1px 3px rgba(0,0,0,0.9)",
                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                transform: isSelected ? "scale(1.15) translateY(-4px)" : "scale(1)",
                zIndex: isSelected ? 10 : 1,
              }}
            >
              {label === "LOGGED" ? "?" : label.slice(0, 3)}
            </div>
          </Marker>
        );
      }),
    [complaints, selectedComplaintId, selectComplaint, flyToComplaint]
  );

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: mapViewport.longitude,
          latitude: mapViewport.latitude,
          zoom: mapViewport.zoom,
        }}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" />
        
        {markers}

        {showCrews && crews.map((crew) => {
          const isSelected = crew.id === selectedCrewId;
          const color = CREW_COLORS[crew.status];
          return (
            <Marker
              key={crew.id}
              longitude={crew.longitude}
              latitude={crew.latitude}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                selectCrew(crew.id);
                flyToComplaint(crew.latitude, crew.longitude);
              }}
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: isSelected ? 20 : 5 }}>
                <div style={{
                  position: "absolute",
                  width: isSelected ? "32px" : "24px",
                  height: isSelected ? "32px" : "24px",
                  borderRadius: "50%",
                  background: color,
                  opacity: 0.3,
                  animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                }} />
                <div style={{
                  width: isSelected ? "16px" : "12px",
                  height: isSelected ? "16px" : "12px",
                  borderRadius: "50%",
                  background: color,
                  border: "2px solid #061F1A",
                  boxShadow: `0 0 10px ${color}`,
                }} />
              </div>
            </Marker>
          );
        })}

        {/* Show popup on hover or selection */}
        {(hoverInfo || selectedComplaintId) && (
          <Popup
            longitude={(hoverInfo ?? complaints.find(c => c.id === selectedComplaintId)!).longitude}
            latitude={(hoverInfo ?? complaints.find(c => c.id === selectedComplaintId)!).latitude}
            anchor="bottom"
            offset={20}
            closeButton={false}
            closeOnClick={false}
            style={{ padding: 0 }}
          >
            <div
              style={{
                background: "rgba(6, 31, 26, 0.8)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "0.5px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "24px",
                padding: "16px 20px",
                minWidth: "220px",
                fontFamily: "Inter, sans-serif",
                color: "#F0F0F0",
                boxShadow: "0 16px 40px rgba(0,0,0,0.8)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "1.2px", fontWeight: 700, textTransform: "uppercase", color: "#B0B0B0" }}>
                  {(hoverInfo ?? complaints.find(c => c.id === selectedComplaintId)!).status.replace("_", " ")}
                </div>
                <div style={{ fontSize: "10px", fontFamily: "JetBrains Mono, monospace", color: "rgba(255,255,255,0.4)" }}>
                  #{(hoverInfo ?? complaints.find(c => c.id === selectedComplaintId)!).id.slice(-5).toUpperCase()}
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{
                  width: "10px", height: "10px", borderRadius: "50%",
                  background: getSeverityColor((hoverInfo ?? complaints.find(c => c.id === selectedComplaintId)!).aiAnalysis?.severityScore),
                  boxShadow: `0 0 8px ${getSeverityColor((hoverInfo ?? complaints.find(c => c.id === selectedComplaintId)!).aiAnalysis?.severityScore)}`
                }} />
                <div style={{ fontWeight: 800, fontSize: "15px", color: "#FFFFFF" }}>
                  {(hoverInfo ?? complaints.find(c => c.id === selectedComplaintId)!).aiAnalysis ? ((hoverInfo ?? complaints.find(c => c.id === selectedComplaintId)!).aiAnalysis!.severityScore * 100).toFixed(0) + "% Severity" : "Pending AI"}
                </div>
              </div>

              {(hoverInfo ?? complaints.find(c => c.id === selectedComplaintId)!).aiAnalysis && (
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "10px", marginTop: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "11px", color: "#E0E0E0", marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#A0A0A0" }}>Classes:</span>
                    <span style={{ fontWeight: 600 }}>{(hoverInfo ?? complaints.find(c => c.id === selectedComplaintId)!).aiAnalysis!.wasteClasses.join(", ")}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#E0E0E0", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#A0A0A0" }}>Logistics:</span>
                    <span style={{ fontWeight: 600 }}>Tier {(hoverInfo ?? complaints.find(c => c.id === selectedComplaintId)!).aiAnalysis!.logisticsTier}</span>
                  </div>
                </div>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-sm border border-border rounded-lg p-3 flex flex-col gap-2 pointer-events-none">
        {[
          { label: "Critical (≥75%)", color: "#FF4D4D" },
          { label: "Moderate (50–75%)", color: "#FF9F43" },
          { label: "Low (<50%)", color: "#FECA57" },
          { label: "Pending AI", color: "#54A0FF" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: item.color, boxShadow: `0 0 6px ${item.color}88` }}
            />
            <span className="text-xs text-muted-foreground font-inter">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
