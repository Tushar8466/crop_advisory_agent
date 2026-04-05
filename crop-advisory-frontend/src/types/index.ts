export type UrgencyLevel = "low" | "medium" | "high" | "critical"
export type DiagnosisCategory = "nutrient" | "disease" | "pest" | "abiotic"
export type TaskId = "task1_diagnose" | "task2_recommend" | "task3_plan"

export interface FarmObservation {
  farm_id: string
  crop: string
  region: string
  soil_ph: number
  rainfall_mm: number
  temperature_c: number
  humidity_pct: number
  growth_stage: string
  symptoms: string
  task_id: TaskId
  task_description: string
  step: number
  max_steps: number
}

export interface ResetResult {
  observation: FarmObservation
  task_id: TaskId
  info: {
    session_id: string
    available_tasks: TaskId[]
    crop: string
    region: string
  }
}

export interface StepResult {
  observation: FarmObservation
  reward: number
  done: boolean
  info: Record<string, any>
}

export interface Episode {
  id: string
  taskId: TaskId
  crop: string
  region: string
  reward: number
  urgency: UrgencyLevel
  payload: Record<string, any>
  info: Record<string, any>
  timestamp: string
  hasImage: boolean
  imageThumbnail?: string
  aiAnalysis?: AnalysisResult
}

// NEW TYPES FOR AI FLOW
export interface FarmerInput {
  cropName: string
  imageBase64: string
  imageFile?: File | null
  taskId: TaskId
}

export interface AnalysisResult {
  diagnosis_category: DiagnosisCategory
  diagnosis: string
  urgency: UrgencyLevel
  treatment?: string
  follow_up_days?: number
  season_plan?: string[]
  raw_response: string
  parse_success: boolean
  confidence: number
}

export interface EpisodeResult {
  farmerInput: FarmerInput
  aiAnalysis: AnalysisResult
  reward: number
  done: boolean
  info: Record<string, any>
}
