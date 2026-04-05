from pydantic import BaseModel
from typing import Dict, Any, Optional, List

class FarmObservation(BaseModel):
    farm_id: str
    crop_name: str
    region: str
    area_size: str
    severity: str
    image_provided: bool
    task_id: str
    task_description: str
    step: int
    max_steps: int

class FarmerInput(BaseModel):
    crop_name: str
    region: str
    area_size: str
    severity: str
    image_base64: Optional[str] = None

class Action(BaseModel):
    task_id: str
    action_type: str
    payload: Dict[str, Any]
    image_base64: Optional[str] = None
    crop_name: Optional[str] = None
    region: Optional[str] = None
    area_size: Optional[str] = None
    severity: Optional[str] = None

class StepResult(BaseModel):
    observation: FarmObservation
    reward: float
    done: bool
    info: Dict[str, Any]
    ai_analysis: Optional[Dict[str, Any]] = None

class ResetResult(BaseModel):
    observation: FarmObservation
    task_id: str
    info: Dict[str, Any]

class StateResult(BaseModel):
    observation: FarmObservation
    step: int
    done: bool

class AnalyzeRequest(BaseModel):
    crop_name: str
    region: str
    area_size: str
    severity: str
    image_base64: str
    task_id: str
    session_id: str

class AnalyzeResult(BaseModel):
    diagnosis_category: str
    diagnosis: str
    urgency: str
    treatment: Optional[str] = None
    follow_up_days: Optional[int] = None
    season_plan: Optional[List[str]] = None
    reward: float
    done: bool
    info: Dict[str, Any]
    raw_llm_response: str
