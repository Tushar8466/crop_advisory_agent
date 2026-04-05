import requests
import json
import base64
import os
import time
from openai import OpenAI
from typing import Dict, Any, List

# ENV VARS
API_BASE_URL = os.environ.get("API_BASE_URL", "https://api.anthropic.com/v1")
MODEL_NAME = os.environ.get("MODEL_NAME", "claude-sonnet-4-20250514")
HF_TOKEN = os.environ.get("HF_TOKEN", "")
ENV_URL = os.environ.get("ENV_URL", "http://localhost:7860")

client = OpenAI(api_key=HF_TOKEN, base_url=API_BASE_URL)

def create_test_image_base64() -> str:
    """Generates a 100x100 green square as a test JPEG."""
    from PIL import Image
    import io
    img = Image.new("RGB", (100, 100), color=(34, 139, 34))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

TEST_IMAGE_B64 = create_test_image_base64()

TEST_CASES = [
  {"crop": "wheat",  "region": "Punjab India",   "area": "2.0 HECTARES", "severity": "HIGH"},
  {"crop": "rice",   "region": "Mekong Vietnam", "area": "1.5 HECTARES", "severity": "CRITICAL"},
  {"crop": "potato", "region": "Andes Peru",     "area": "0.5 HECTARES", "severity": "CRITICAL"},
]

AVAILABLE_TASKS = ["task1_diagnose", "task2_recommend", "task3_plan"]

def build_task_prompt(task_id: str, test_case: dict, obs: dict) -> str:
    base = f"""
    Crop: {test_case["crop"]}
    Region: {test_case["region"]}
    Area: {test_case["area"]}
    Severity: {test_case["severity"]}
    Task: {task_id}
    """
    if task_id == "task1_diagnose":
        return base + "\nAnalyze the image and return JSON: {'diagnosis_category':'...','diagnosis':'...','urgency':'...'}"
    elif task_id == "task2_recommend":
        return base + "\nAnalyze the image and return JSON: {'diagnosis_category':'...','diagnosis':'...','urgency':'...','treatment':'...','follow_up_days':7}"
    else:
        return base + "\nAnalyze the image and return JSON: {'diagnosis_category':'...','diagnosis':'...','urgency':'...','treatment':'...','follow_up_days':7,'season_plan':['step1','step2','step3','step4']}"

def run_episode(task_id: str, episode_num: int, test_case: dict) -> float:
    # STEP 1: POST /reset with farmer input
    resp = requests.post(
        f"{ENV_URL}/reset",
        params={"task_id": task_id},
        json={
            "crop_name": test_case["crop"],
            "region": test_case["region"],
            "area_size": test_case["area"],
            "severity": test_case["severity"],
            "image_base64": TEST_IMAGE_B64
        }
    )
    if resp.status_code != 200:
        raise Exception(f"Reset failed: {resp.text}")
    
    reset_data = resp.json()
    session_id = reset_data["info"]["session_id"]
    obs = reset_data["observation"]

    # Print [START]
    print(json.dumps({
        "type": "[START]",
        "episode": episode_num,
        "task_id": task_id,
        "crop": test_case["crop"],
        "region": test_case["region"],
        "severity": test_case["severity"],
        "image_provided": True
    }))

    # STEP 2: Call LLM directly with image (required by rules for standalone inference)
    response = client.chat.completions.create(
        model=MODEL_NAME,
        max_tokens=1000,
        messages=[
            {
                "role": "system",
                "content": "You are an expert agronomist. Analyze the crop image and respond with JSON only. No markdown."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{TEST_IMAGE_B64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": build_task_prompt(task_id, test_case, obs)
                    }
                ]
            }
        ]
    )
    
    raw = response.choices[0].message.content
    raw = raw.replace("```json","").replace("```","").strip()
    
    try:
        payload = json.loads(raw)
        payload["image_provided"] = True
        payload["image_base64"] = TEST_IMAGE_B64
    except:
        payload = {"diagnosis": "unidentified", "urgency": "medium", "diagnosis_category": "unknown", "image_provided": True}

    # STEP 3: POST /step with LLM payload to verify score
    step_resp = requests.post(
        f"{ENV_URL}/step",
        params={"session_id": session_id},
        json={
            "task_id": task_id,
            "action_type": task_id,
            "payload": payload,
            "image_base64": TEST_IMAGE_B64,
            "crop_name": test_case["crop"],
        }
    )
    if step_resp.status_code != 200:
        raise Exception(f"Step failed: {step_resp.text}")
        
    step_data = step_resp.json()
    reward = step_data["reward"]
    info   = step_data["info"]

    # Print [STEP]
    print(json.dumps({
        "type": "[STEP]",
        "episode": episode_num,
        "task_id": task_id,
        "step": 1,
        "crop": test_case["crop"],
        "image_analyzed": True,
        "ai_diagnosis": payload.get("diagnosis"),
        "ai_urgency": payload.get("urgency"),
        "reward": reward,
        "done": True,
        "info": info
    }))

    # Print [END]
    print(json.dumps({
        "type": "[END]",
        "episode": episode_num,
        "task_id": task_id,
        "total_reward": reward,
        "steps": 1
    }))

    return reward

def main():
    all_scores = {}
    episode = 0
    
    for task_id in AVAILABLE_TASKS:
        scores = []
        for i, test_case in enumerate(TEST_CASES):
            try:
                r = run_episode(task_id, episode, test_case)
                scores.append(r)
            except Exception as e:
                print(json.dumps({
                    "type": "[STEP]",
                    "episode": episode,
                    "error": str(e)
                }))
                scores.append(0.0)
            episode += 1
            time.sleep(2)
        
        avg = round(sum(scores)/len(scores), 4) if scores else 0.0
        all_scores[task_id] = {"scores": scores, "avg": avg}
        
        print(json.dumps({
            "type": "[END]",
            "task_summary": task_id,
            "avg_reward": avg,
            "runs": scores
        }))
    
    print(json.dumps({
        "type": "[END]",
        "final_scores": all_scores
    }))

if __name__ == "__main__":
    main()
