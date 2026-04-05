def image_bonus(payload: dict) -> float:
    if payload.get("image_provided") or \
       payload.get("image_base64"):
        return 0.05
    return 0.0

def grade_task1(ref_case: dict, payload: dict):
    base_reward = 0.0
    info = {"matches": []}
    
    # Category match
    if ref_case["true_category"].lower() == payload.get("diagnosis_category", "").lower():
        base_reward += 0.3
        info["matches"].append("category")
        
    # Diagnosis match (loose)
    ref_diag = ref_case["true_diagnosis"].lower().replace(" ", "_")
    pay_diag = payload.get("diagnosis", "").lower().replace(" ", "_")
    if ref_diag in pay_diag or pay_diag in ref_diag:
        base_reward += 0.4
        info["matches"].append("diagnosis")
        
    # Urgency match
    if ref_case["true_urgency"].lower() == payload.get("urgency", "").lower():
        base_reward += 0.2
        info["matches"].append("urgency")
        
    reward = min(base_reward + image_bonus(payload), 1.0)
    return reward, info

def grade_task2(ref_case: dict, payload: dict):
    base_r, info = grade_task1(ref_case, payload)
    
    # Treatment check (length and content)
    treatment = payload.get("treatment", "")
    if len(treatment) > 30:
        base_r += 0.2
        info["matches"].append("treatment_detail")
    
    reward = min(base_r + image_bonus(payload), 1.0)
    return reward, info

def grade_task3(ref_case: dict, payload: dict):
    base_r, info = grade_task2(ref_case, payload)
    
    # Seasonal plan check
    plan = payload.get("season_plan", [])
    if isinstance(plan, list) and len(plan) >= 4:
        base_r += 0.1
        info["matches"].append("seasonal_plan")
        
    reward = min(base_r + image_bonus(payload), 1.0)
    return reward, info

TASK_GRADERS = {
    "task1_diagnose": grade_task1,
    "task2_recommend": grade_task2,
    "task3_plan": grade_task3
}

def get_task_description(task_id: str):
    descriptions = {
        "task1_diagnose": 
            "EASY — Upload your crop photo. AI will identify the problem category (nutrient/disease/pest/abiotic), specific diagnosis name, and urgency level.",
        "task2_recommend": 
            "MEDIUM — Upload your crop photo. AI will identify the problem and recommend a specific treatment with product names, application rates and follow-up plan.",
        "task3_plan": 
            "HARD — Upload your crop photo. AI will provide complete diagnosis, treatment protocol and a full 4-6 step seasonal action plan."
    }
    return descriptions.get(task_id, "Analyze the crop and provide advice.")
