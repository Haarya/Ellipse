export function getLocationName(latitude: number, longitude: number): string {
  // Mock bounding boxes for Mumbai areas since we don't have a live geocoding API
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (lat > 19.09 && lng < 72.85) return "Juhu / Vile Parle";
  if (lat > 19.08 && lat <= 19.09 && lng > 72.85 && lng < 72.87) return "Santacruz East";
  if (lat > 19.08 && lng >= 72.87) return "Vidyavihar / Kurla East";
  if (lat > 19.07 && lat <= 19.08 && lng > 72.87 && lng < 72.89) return "Central Kurla";
  if (lat > 19.06 && lat <= 19.07 && lng >= 72.87 && lng < 72.89) return "BKC (Bandra Kurla Complex)";
  if (lat > 19.05 && lat <= 19.07 && lng >= 72.89) return "Chembur";
  if (lat <= 19.05 && lat > 19.02 && lng < 72.85) return "Dadar / Worli";
  if (lat <= 19.02 && lng < 72.83) return "South Mumbai / Colaba";

  return "Mumbai Metro Area";
}
