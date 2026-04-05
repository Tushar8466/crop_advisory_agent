from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional, List
import uuid
import os
import json
import base64
from openai import OpenAI

from env.models import (
    FarmObservation, FarmerInput, Action, StepResult, 
    ResetResult, StateResult, AnalyzeRequest, AnalyzeResult
)
from env.data import get_random_case, get_case_by_crop, SEVERITY_TO_URGENCY
from env.tasks import TASK_GRADERS, get_task_description

app = FastAPI(title="Crop Advisory OpenEnv Backend")

# CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ENVVARS
API_BASE_URL = os.environ.get("API_BASE_URL", "https://api.anthropic.com/v1")
MODEL_NAME = os.environ.get("MODEL_NAME", "claude-sonnet-4-20250514")
HF_TOKEN = os.environ.get("HF_TOKEN", "")

# LLM Client
llm_client = OpenAI(
    api_key=HF_TOKEN,
    base_url=API_BASE_URL
)

sessions = {}
AVAILABLE_TASKS = ["task1_diagnose", "task2_recommend", "task3_plan"]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/tasks")
def list_tasks():
    return [
        {
            "id": t,
            "description": get_task_description(t)
        } for t in AVAILABLE_TASKS
    ]

@app.post("/reset")
def reset(
    task_id: str = "task1_diagnose",
    farmer_input: Optional[FarmerInput] = None
):
    session_id = str(uuid.uuid4())
    
    if farmer_input:
      crop_name = farmer_input.crop_name
      region = farmer_input.region
      area_size = farmer_input.area_size
      severity = farmer_input.severity
      has_image = farmer_input.image_base64 is not None
    else:
      case = get_random_case()
      crop_name = case["crop"]
      region = case["region"]
      area_size = "1.0 HECTARES"
      severity = "MODERATE"
      has_image = False
    
    sessions[session_id] = {
      "task_id": task_id,
      "crop_name": crop_name,
      "region": region,
      "area_size": area_size,
      "severity": severity,
      "image_base64": farmer_input.image_base64 if farmer_input else None,
      "step": 0,
      "done": False,
      "total_reward": 0.0,
    }
    
    obs = FarmObservation(
      farm_id=session_id[:8],
      crop_name=crop_name,
      region=region,
      area_size=area_size,
      severity=severity,
      image_provided=has_image,
      task_id=task_id,
      task_description=get_task_description(task_id),
      step=0,
      max_steps=1,
    )
    
    return ResetResult(
      observation=obs,
      task_id=task_id,
      info={
        "session_id": session_id,
        "available_tasks": AVAILABLE_TASKS,
        "crop_name": crop_name,
        "region": region,
        "image_provided": has_image,
      }
    )

@app.post("/analyze")
def analyze(request: AnalyzeRequest):
    # STEP 1 — Build LLM prompt with image
    system_prompt = """You are an expert agronomist AI.
Deliver a complete diagnostic assessment for an agronomist mission.
Respond ONLY with valid JSON, no markdown, no explanation.

For task1_diagnose respond:
{
  "diagnosis_category": "nutrient|disease|pest|abiotic",
  "diagnosis": "specific_problem_in_snake_case",
  "urgency": "low|medium|high|critical",
  "confidence": <float between 0 and 1>
}

For task2_recommend respond:
{
  "diagnosis_category": "nutrient|disease|pest|abiotic",
  "diagnosis": "specific_problem_in_snake_case",
  "urgency": "low|medium|high|critical",
  "confidence": <float between 0 and 1>,
  "treatment": "detailed treatment with product name, application rate and method",
  "follow_up_days": <integer between 1 and 30>
}

For task3_plan respond:
{
  "diagnosis_category": "nutrient|disease|pest|abiotic",
  "diagnosis": "specific_problem_in_snake_case",
  "urgency": "low|medium|high|critical",
  "confidence": <float between 0 and 1>,
  "treatment": "detailed treatment protocol",
  "follow_up_days": <integer between 1 and 30>,
  "season_plan": [
    "Immediate action step",
    "Second action step",
    "Third action step",
    "Fourth action step"
  ]
}"""

    user_message = f"""A farmer has submitted this crop photo.

Crop: {request.crop_name}
Region: {request.region}
Farm area: {request.area_size}
Observed severity: {request.severity}
Mission ID: {request.task_id}

Analyze the agricultural visuals carefully and provide your assessment as JSON ONLY."""

    # STEP 2 — Call LLM with vision
    try:
        response = llm_client.chat.completions.create(
            model=MODEL_NAME,
            max_tokens=1000,
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{request.image_base64}"
                            }
                        },
                        {
                            "type": "text",
                            "text": user_message
                        }
                    ]
                }
            ]
        )
        raw_response = response.choices[0].message.content
        
    except Exception as e:
        raise HTTPException(500, f"Diagnostic analysis failed: {str(e)}")

    # STEP 3 — Parse LLM JSON response
    try:
        clean = raw_response.strip()
        clean = clean.replace("```json", "").replace("```", "")
        ai_payload = json.loads(clean.strip())
        ai_payload["image_provided"] = True
        ai_payload["image_base64"] = request.image_base64
    except json.JSONDecodeError:
        ai_payload = build_fallback_payload(request.task_id, request.crop_name, request.severity)

    # STEP 4 — Get reference case for grading
    ref_case = get_case_by_crop(request.crop_name)

    # STEP 5 — Run grader
    grader = TASK_GRADERS[request.task_id]
    reward, info = grader(ref_case, ai_payload)
    reward = round(reward, 4)

    # STEP 6 — Update session
    if request.session_id in sessions:
        sess = sessions[request.session_id]
        sess["step"] += 1
        sess["done"] = True
        sess["total_reward"] = reward

    # STEP 7 — Return result
    return AnalyzeResult(
        diagnosis_category=ai_payload.get("diagnosis_category", "unknown"),
        diagnosis=ai_payload.get("diagnosis", "unknown"),
        urgency=ai_payload.get("urgency", "medium"),
        treatment=ai_payload.get("treatment"),
        follow_up_days=ai_payload.get("follow_up_days"),
        season_plan=ai_payload.get("season_plan"),
        reward=reward,
        done=True,
        info={
            **info,
            "session_id": request.session_id,
            "crop_name": request.crop_name,
            "region": request.region,
            "reference_case": ref_case["id"],
            "image_analyzed": True,
            "ai_confidence": ai_payload.get("confidence", 0.0),
        },
        raw_llm_response=raw_response,
    )

def build_fallback_payload(task_id, crop_name, severity):
    urgency = SEVERITY_TO_URGENCY.get(severity.upper(), "medium")
    base = {
      "diagnosis_category": "disease",
      "diagnosis": "unidentified_crop_disease",
      "urgency": urgency,
      "confidence": 0.5,
      "image_provided": True,
    }
    if task_id in ("task2_recommend", "task3_plan"):
      base["treatment"] = f"Urgent consultation required for {crop_name}. Isolate the plot and apply broad spectrum protection."
      base["follow_up_days"] = 7
    if task_id == "task3_plan":
      base["season_plan"] = [
        "Isolate affected areas in Nairobi Sector",
        "Apply broad spectrum protection within 24 hours",
        "Begin rigorous daily scouting for symptoms",
        "Contact local agricultural extension for confirmation"
      ]
    return base

@app.post("/step")
def step(
    session_id: str,
    action: Action
):
    if session_id not in sessions:
        raise HTTPException(404, "Mission session not found.")
    
    sess = sessions[session_id]
    if sess["done"]:
        raise HTTPException(400, "Mission already completed.")
    
    # Grading text-based submission
    ref_case = get_case_by_crop(action.crop_name or sess["crop_name"])
    grader = TASK_GRADERS[action.task_id]
    reward, info = grader(ref_case, action.payload)
    
    sess["step"] += 1
    sess["done"] = True
    sess["total_reward"] = reward
    
    return StepResult(
        observation=FarmObservation(
            farm_id=session_id[:8],
            crop_name=sess["crop_name"],
            region=sess["region"],
            area_size=sess["area_size"],
            severity=sess["severity"],
            image_provided=True if action.image_base64 else False,
            task_id=sess["task_id"],
            task_description=get_task_description(sess["task_id"]),
            step=sess["step"],
            max_steps=1,
        ),
        reward=reward,
        done=True,
        info={**info, "session_id": session_id}
    )

@app.get("/state")
def state(session_id: str):
    if session_id not in sessions:
        raise HTTPException(404, "Session not found.")
    sess = sessions[session_id]
    return StateResult(
        observation=FarmObservation(
            farm_id=session_id[:8],
            crop_name=sess["crop_name"],
            region=sess["region"],
            area_size=sess["area_size"],
            severity=sess["severity"],
            image_provided=sess["image_base64"] is not None,
            task_id=sess["task_id"],
            task_description=get_task_description(sess["task_id"]),
            step=sess["step"],
            max_steps=1,
        ),
        step=sess["step"],
        done=sess["done"]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
