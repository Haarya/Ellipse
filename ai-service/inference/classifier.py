import logging
import torch
import open_clip
from PIL import Image

logger = logging.getLogger("uvicorn")

# ---------------------------------------------------------------------------
# Macro → Legacy class mapping (keeps severity.py untouched)
# ---------------------------------------------------------------------------
MACRO_TO_LEGACY = {
    "Recyclable waste": "recyclable",
    "Non-recyclable municipal trash": "non-recyclable",
    "Hazardous chemical or toxic waste": "hazardous",
    "Organic compostable bio-waste": "organic",
    "Construction and demolition debris": "non-recyclable",
}

# ---------------------------------------------------------------------------
# Label sets for hierarchical classification
# ---------------------------------------------------------------------------
MACRO_LABELS = [
    "Recyclable waste",
    "Non-recyclable municipal trash",
    "Hazardous chemical or toxic waste",
    "Organic compostable bio-waste",
    "Construction and demolition debris",
]

MICRO_LABELS = {
    "Recyclable waste": [
        "Electronic waste and circuit boards (e-waste)",
        "Plastic bottles and plastic packaging",
        "Cardboard and paper packaging",
        "Metal scrap and beverage cans",
        "Glass bottles and broken glass",
    ],
    "Hazardous chemical or toxic waste": [
        "Batteries and battery acid",
        "Medical and biohazard waste",
        "Industrial chemical drums or paint",
        "Fluorescent lighting and heavy metals",
    ],
    "Non-recyclable municipal trash": [
        "Mixed household garbage and food wrappers",
        "Styrofoam and polystyrene packaging",
        "Soiled paper products and tissues",
        "Cigarette butts and small litter",
        "Composite multi-material packaging",
    ],
    "Organic compostable bio-waste": [
        "Food scraps and kitchen waste",
        "Garden waste, leaves, and yard trimmings",
        "Animal waste and manure",
        "Spoiled fruits and vegetables",
        "Wood chips and natural fibers",
    ],
    "Construction and demolition debris": [
        "Concrete rubble and masonry",
        "Scrap wood and timber",
        "Metal rebar and structural steel",
        "Broken tiles, ceramics, and porcelain",
        "Asphalt and roofing materials",
    ],
}


class HierarchicalClassifier:
    """
    Two-stage zero-shot image classifier using MobileCLIP-S0.
    
    Stage 1 (Macro): Classifies into one of 5 broad waste categories.
    Stage 2 (Micro): Drills down into sub-categories based on the macro result.
    
    The model is loaded eagerly at __init__ so it is pre-warmed before any
    requests arrive (eliminates cold-start latency for users).
    """

    def __init__(self):
        logger.info("Loading MobileCLIP-S0 model (pre-warming)...")
        
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            "MobileCLIP-S0", pretrained="datacomp"
        )
        self.tokenizer = open_clip.get_tokenizer("MobileCLIP-S0")
        self.model = self.model.to(self.device)
        self.model.eval()
        
        # Pre-tokenize all label sets so we don't repeat work per-request
        self._macro_tokens = self.tokenizer(MACRO_LABELS).to(self.device)
        self._micro_tokens = {}
        for macro_label, micro_labels in MICRO_LABELS.items():
            self._micro_tokens[macro_label] = self.tokenizer(micro_labels).to(self.device)
        
        logger.info(f"MobileCLIP-S0 loaded successfully on {self.device}.")

    def _zero_shot(self, image: Image.Image, labels: list[str], text_tokens: torch.Tensor) -> list[dict]:
        """
        Run zero-shot classification against pre-tokenized text labels.
        Returns a list of {label, score} sorted by descending score.
        """
        img_tensor = self.preprocess(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            image_features = self.model.encode_image(img_tensor)
            text_features = self.model.encode_text(text_tokens)

            # L2-normalize
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            text_features = text_features / text_features.norm(dim=-1, keepdim=True)

            # Cosine similarity → softmax probabilities
            similarity = (image_features @ text_features.T).squeeze(0)
            probs = similarity.softmax(dim=-1).cpu().tolist()

        results = [{"label": lbl, "score": score} for lbl, score in zip(labels, probs)]
        results.sort(key=lambda x: x["score"], reverse=True)
        return results

    def classify(self, image: Image.Image) -> dict:
        """
        Run the full two-stage hierarchical classification on a single image crop.
        
        Returns:
            {
                "macro_label": str,       # e.g. "Recyclable waste"
                "macro_score": float,     # e.g. 0.87
                "micro_label": str|None,  # e.g. "Plastic bottles and plastic packaging"
                "micro_score": float|None,
                "class": str,             # legacy: "recyclable" (for severity.py compat)
                "confidence": float,      # legacy: macro_score (for severity.py compat)
            }
        """
        # Stage 1: Macro classification
        macro_results = self._zero_shot(image, MACRO_LABELS, self._macro_tokens)
        top_macro = macro_results[0]

        # Stage 2: Micro drill-down
        micro_label = None
        micro_score = None

        macro_key = top_macro["label"]
        if macro_key in MICRO_LABELS:
            micro_results = self._zero_shot(
                image, MICRO_LABELS[macro_key], self._micro_tokens[macro_key]
            )
            micro_label = micro_results[0]["label"]
            micro_score = micro_results[0]["score"]

        return {
            "macro_label": top_macro["label"],
            "macro_score": top_macro["score"],
            "micro_label": micro_label,
            "micro_score": micro_score,
            # Legacy bridge for severity.py backward-compatibility
            "class": MACRO_TO_LEGACY.get(top_macro["label"], "non-recyclable"),
            "confidence": top_macro["score"],
        }
