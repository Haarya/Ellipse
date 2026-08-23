def compute_severity(detection_results, classification_results, volume_metrics=None):
    """
    Computes a severity score (0.0 to 1.0) and assigns a logistics tier (1 to 4).
    Based on metric volume estimation and MobileCLIP classification types.
    """
    
    # 1. Base score from volume (m3)
    if volume_metrics is None:
        volume_metrics = {}
    volume_m3 = volume_metrics.get("volumeM3", 0.0)
    
    # Scale: < 0.1m3 is trivial, 3.0m3 is massive
    # Using a simple logarithmic curve or capped linear scaling
    base_score = min(volume_m3 * 0.3, 0.8) 
    
    # 2. Hazard multiplier and flags based on classification
    has_hazardous = False
    hazard_score = 0.0
    hazard_flags = []
    
    macro_classes = [c.get("class", "") for c in classification_results]
    micro_classes = [c.get("micro_label", "") for c in classification_results]
    
    # Detect exact specific hazards from micro-labels
    for m in micro_classes:
        if m is None: continue
        m_lower = m.lower()
        if "medical" in m_lower or "biohazard" in m_lower:
            hazard_flags.append("BIOHAZARD")
        if "electronic waste" in m_lower or "e-waste" in m_lower:
            hazard_flags.append("E_WASTE")
        if "battery" in m_lower or "acid" in m_lower:
            hazard_flags.append("CORROSIVE_BATTERY")
        if "chemical" in m_lower or "paint" in m_lower:
            hazard_flags.append("CHEMICAL_WASTE")
    
    if "hazardous" in macro_classes:
        hazard_score = 0.5
        has_hazardous = True
        if not hazard_flags:
            hazard_flags.append("GENERAL_HAZARD")
    elif "non-recyclable" in macro_classes:
        hazard_score = 0.2
    elif "organic" in macro_classes:
        hazard_score = 0.1
        
    final_score = min(base_score + hazard_score, 1.0)
    
    # Map to tier (1=Critical, 2=High, 3=Medium, 4=Low)
    tier = 4
    if final_score > 0.85 or has_hazardous:
        tier = 1
    elif final_score > 0.6:
        tier = 2
    elif final_score > 0.35:
        tier = 3
        
    return {
        "severityScore": round(final_score, 2),
        "logisticsTier": tier,
        "hazardFlags": list(set(hazard_flags))
    }
