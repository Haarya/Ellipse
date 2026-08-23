def compute_severity(detection_results, classification_results, volume_metrics=None):
    """
    Computes a severity score (0.0 to 1.0) and assigns a logistics tier (1 to 4).
    Based heavily on waste classification types, with volume acting as a modifier.
    """
    
    macro_classes = [c.get("macro_label", "") for c in classification_results]
    micro_classes = [c.get("micro_label", "") for c in classification_results]
    
    # 1. Base Score from Waste Category
    base_score = 0.0
    has_hazardous = False
    
    if "Hazardous chemical or toxic waste" in macro_classes:
        base_score = max(base_score, 0.85)
        has_hazardous = True
    elif "Construction and demolition debris" in macro_classes:
        base_score = max(base_score, 0.70)
    elif "Non-recyclable municipal trash" in macro_classes:
        base_score = max(base_score, 0.40)
    elif "Organic compostable bio-waste" in macro_classes:
        base_score = max(base_score, 0.30)
    elif "Recyclable waste" in macro_classes:
        base_score = max(base_score, 0.20)
        
    # 2. Volume Modifier (up to +30%)
    if volume_metrics is None:
        volume_metrics = {}
    volume_m3 = volume_metrics.get("volumeM3", 0.0)
    volume_bonus = min(volume_m3 * 0.15, 0.30)
    
    # 3. Detect exact specific hazards from micro-labels (Overrides to 1.0)
    hazard_flags = []
    override_to_critical = False
    
    for m in micro_classes:
        if m is None: continue
        m_lower = m.lower()
        if "medical" in m_lower or "biohazard" in m_lower:
            hazard_flags.append("BIOHAZARD")
            override_to_critical = True
        if "electronic waste" in m_lower or "e-waste" in m_lower:
            hazard_flags.append("E_WASTE")
            override_to_critical = True
        if "battery" in m_lower or "acid" in m_lower:
            hazard_flags.append("CORROSIVE_BATTERY")
            override_to_critical = True
        if "chemical" in m_lower or "paint" in m_lower:
            hazard_flags.append("CHEMICAL_WASTE")
            override_to_critical = True
            
    if has_hazardous and not hazard_flags:
        hazard_flags.append("GENERAL_HAZARD")
        
    # Calculate Final Score
    if override_to_critical:
        final_score = 1.0
    else:
        final_score = min(base_score + volume_bonus, 1.0)
    
    # Map to tier (1=Critical, 2=High, 3=Medium, 4=Low)
    tier = 4
    if final_score >= 0.85 or has_hazardous:
        tier = 1
    elif final_score >= 0.60:
        tier = 2
    elif final_score >= 0.35:
        tier = 3
        
    return {
        "severityScore": round(final_score, 2),
        "logisticsTier": tier,
        "hazardFlags": list(set(hazard_flags))
    }
