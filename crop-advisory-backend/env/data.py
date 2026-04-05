import random

FARM_CASES = [
    {
        "id": "CASE_1",
        "crop": "wheat",
        "region": "Punjab, India",
        "symptoms": "Yellow stripes on leaves, stunted growth",
        "true_diagnosis": "Nitrogen Deficiency",
        "true_category": "nutrient",
        "true_urgency": "medium",
        "true_treatment": "Apply urea top-dressing 50kg/ha"
    },
    {
        "id": "CASE_2",
        "crop": "corn",
        "region": "Iowa, USA",
        "symptoms": "Large rectangular brown lesions on lower leaves",
        "true_diagnosis": "Gray Leaf Spot",
        "true_category": "disease",
        "true_urgency": "high",
        "true_treatment": "Apply strobilurin fungicide"
    },
    {
        "id": "CASE_3",
        "crop": "rice",
        "region": "Vietnam",
        "symptoms": "V-shaped lesions starting from leaf tips",
        "true_diagnosis": "Bacterial Leaf Blight",
        "true_category": "disease",
        "true_urgency": "critical",
        "true_treatment": "Drain field, limit nitrogen, apply copper-based bactericide"
    },
    {
        "id": "CASE_4",
        "crop": "potato",
        "region": "Idaho, USA",
        "symptoms": "Dark water-soaked spots with white fuzzy growth",
        "true_diagnosis": "Late Blight",
        "true_category": "disease",
        "true_urgency": "critical",
        "true_treatment": "Apply mancozeb or chlorothalonil weekly"
    },
    {
        "id": "CASE_5",
        "crop": "coffee",
        "region": "Brazil",
        "symptoms": "Orange powdery spots on leaf undersides",
        "true_diagnosis": "Coffee Leaf Rust",
        "true_category": "disease",
        "true_urgency": "high",
        "true_treatment": "Prune for airflow, apply copper fungicide"
    },
    {
        "id": "CASE_6",
        "crop": "soybean",
        "region": "Mato Grosso, Brazil",
        "symptoms": "Rust-colored pustules on leaf surface",
        "true_diagnosis": "Asian Soybean Rust",
        "true_category": "disease",
        "true_urgency": "high",
        "true_treatment": "Apply preventative fungicide mixture"
    },
    {
        "id": "CASE_7",
        "crop": "cotton",
        "region": "Texas, USA",
        "symptoms": "Leaves turning red/purple between veins",
        "true_diagnosis": "Magnesium Deficiency",
        "true_category": "nutrient",
        "true_urgency": "low",
        "true_treatment": "Folier spray of magnesium sulfate"
    },
    {
        "id": "CASE_8",
        "crop": "tomato",
        "region": "Italy",
        "symptoms": "Bullseye spots on old leaves, yellowing halos",
        "true_diagnosis": "Early Blight",
        "true_category": "disease",
        "true_urgency": "medium",
        "true_treatment": "Remove lower infected leaves, apply fungicide"
    },
    {
        "id": "CASE_9",
        "crop": "banana",
        "region": "Ecuador",
        "symptoms": "Yellow streaks turn black and kill leaves",
        "true_diagnosis": "Black Sigatoka",
        "true_category": "disease",
        "true_urgency": "critical",
        "true_treatment": "Frequent aerial fungicide application"
    },
    {
        "id": "CASE_10",
        "crop": "apple",
        "region": "Washington, USA",
        "symptoms": "Brown scabby lesions on leaves and fruit",
        "true_diagnosis": "Apple Scab",
        "true_category": "disease",
        "true_urgency": "medium",
        "true_treatment": "Apply sulfur or lime sulfur during dormancy"
    }
]

def get_random_case():
    return random.choice(FARM_CASES)

def get_case_by_crop(crop_name: str) -> dict:
    crop_lower = crop_name.lower().strip()
    for case in FARM_CASES:
        if case["crop"].lower() in crop_lower or \
           crop_lower in case["crop"].lower():
            return case
    return random.choice(FARM_CASES)

SEVERITY_TO_URGENCY = {
    "LOW":      "low",
    "MILD":     "low", 
    "MODERATE": "medium",
    "HIGH":     "high",
    "SEVERE":   "high",
    "CRITICAL": "critical",
    "EXTREME":  "critical",
}
