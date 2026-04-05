"use client"
import { create } from "zustand"
import { api } from "@/lib/api"
import { analyzeCrop } from "@/lib/llmAnalysis"
import { useHistoryStore } from "./historyStore"
import type { FarmObservation, StepResult, TaskId, AnalysisResult } from "@/types"

interface AnalysisStep {
  id: string
  label: string
  status: "pending" | "loading" | "complete" | "error"
}

interface EnvStore {
  envUrl: string
  healthStatus: "online" | "offline" | "loading"
  sessionId: string | null
  observation: FarmObservation | null
  lastResult: StepResult | null
  aiAnalysis: AnalysisResult | null
  isAnalyzing: boolean
  isLoading: boolean
  error: string | null
  useMock: boolean
  currentTask: TaskId
  imageBase64: string | null
  imageFile: File | null
  cropName: string
  analysisSteps: AnalysisStep[]
  
  setEnvUrl: (url: string) => void
  setUseMock: (val: boolean) => void
  setCurrentTask: (task: TaskId) => void
  setImage: (base64: string, file: File) => void
  clearImage: () => void
  setCropName: (name: string) => void
  checkHealth: () => Promise<void>
  runAnalysis: (taskId: TaskId) => Promise<void>
  resetEpisode: () => void
  clearError: () => void
}

const getTaskDescription = (taskId: TaskId) => {
  switch (taskId) {
    case "task1_diagnose": return "Identify the primary crop health issue from environmental context and symptoms."
    case "task2_recommend": return "Provide precise treatment protocol including timing and frequency."
    case "task3_plan": return "Build a comprehensive seasonal action plan for long-term farm resilience."
    default: return ""
  }
}

const MOCK_CASES = [
  {
    farm_id: "CASE_A",
    region: "Punjab, India",
    soil_ph: 7.2,
    rainfall_mm: 45,
    temperature_c: 28,
    humidity_pct: 65,
    growth_stage: "tillering",
    symptoms: "Yellow stripes on leaves, stunted growth, pale green color spreading from leaf tips",
    true_diagnosis: "Nitrogen Deficiency",
    true_urgency: "medium"
  },
  {
    farm_id: "CASE_B",
    region: "Nairobi, Kenya",
    soil_ph: 6.5,
    rainfall_mm: 120,
    temperature_c: 24,
    humidity_pct: 85,
    growth_stage: "flowering",
    symptoms: "Tiny white flies on leaf undersides, sticky soot-like mold growing on upper surfaces, curling leaves",
    true_diagnosis: "Whitefly Infestation",
    true_urgency: "high"
  },
  {
    farm_id: "CASE_C",
    region: "Idaho, USA",
    soil_ph: 5.8,
    rainfall_mm: 30,
    temperature_c: 18,
    humidity_pct: 90,
    growth_stage: "tuber_bulking",
    symptoms: "Dark, water-soaked spots on leaves with fuzzy white growth on undersides, rotting odor in the field",
    true_diagnosis: "Late Blight",
    true_urgency: "high"
  }
]

const createMockObservation = (taskId: TaskId, crop: string): FarmObservation => {
  const idx = Math.floor(Date.now() / 1000) % MOCK_CASES.length
  const cs = MOCK_CASES[idx]
  return {
    ...cs,
    crop,
    task_id: taskId,
    task_description: getTaskDescription(taskId),
    step: 0,
    max_steps: 1
  }
}

export const useEnvStore = create<EnvStore>((set, get) => ({
  envUrl: process.env.NEXT_PUBLIC_ENV_URL ?? "http://localhost:7860",
  healthStatus: "loading",
  sessionId: null,
  observation: null,
  lastResult: null,
  aiAnalysis: null,
  isAnalyzing: false,
  isLoading: false,
  error: null,
  useMock: false,
  currentTask: "task1_diagnose",
  imageBase64: null,
  imageFile: null,
  cropName: "",
  analysisSteps: [],

  setEnvUrl: (url) => set({ envUrl: url }),
  setUseMock: (useMock) => set({ useMock, error: null }),
  setCurrentTask: (currentTask) => set({ currentTask }),
  setImage: (base64, file) => set({ imageBase64: base64, imageFile: file }),
  clearImage: () => set({ imageBase64: null, imageFile: null }),
  setCropName: (cropName) => set({ cropName }),
  clearError: () => set({ error: null }),

  checkHealth: async () => {
    try {
      await api.health()
      set({ healthStatus: "online" })
    } catch {
      set({ healthStatus: "offline" })
    }
  },

  resetEpisode: () => {
    set({
      observation: null,
      lastResult: null,
      aiAnalysis: null,
      isAnalyzing: false,
      imageBase64: null,
      imageFile: null,
      cropName: "",
      analysisSteps: [],
      error: null,
      sessionId: null
    })
  },

  runAnalysis: async (taskId) => {
    const { imageBase64, cropName, healthStatus } = get()
    if (!imageBase64 || !cropName) {
      set({ error: "Please provide both a photo and crop name." })
      return
    }

    set({ 
      isAnalyzing: true, 
      error: null, 
      currentTask: taskId,
      analysisSteps: [
        { id: "reset", label: "Connecting to farm environment...", status: "loading" },
        { id: "ai", label: "AI analyzing crop visuals...", status: "pending" },
        { id: "grade", label: "Verifying diagnosis with experts...", status: "pending" }
      ]
    })

    let obs: FarmObservation
    let sId: string | null = null

    // 1. ENVIRONMENT RESET
    try {
      if (healthStatus === "online") {
        const resetRes = await api.reset(taskId)
        obs = resetRes.observation
        sId = resetRes.info.session_id
      } else {
        obs = createMockObservation(taskId, cropName)
      }
      set(state => ({
        analysisSteps: state.analysisSteps.map(s => s.id === "reset" ? { ...s, status: "complete" } : s.id === "ai" ? { ...s, status: "loading" } : s)
      }))
    } catch (e) {
      obs = createMockObservation(taskId, cropName)
      set(state => ({
        analysisSteps: state.analysisSteps.map(s => s.id === "reset" ? { ...s, status: "complete" } : s.id === "ai" ? { ...s, status: "loading" } : s)
      }))
    }

    // 2. LLM ANALYSIS
    let analysis: AnalysisResult
    try {
      analysis = await analyzeCrop(imageBase64, cropName, taskId, obs)
      set({ aiAnalysis: analysis })
      set(state => ({
        analysisSteps: state.analysisSteps.map(s => s.id === "ai" ? { ...s, status: "complete" } : s.id === "grade" ? { ...s, status: "loading" } : s)
      }))
    } catch (e) {
      set({ error: "AI Analysis failed to generate.", isAnalyzing: false })
      return
    }

    // 3. GRADING / STEP
    try {
      let finalResult: StepResult
      if (healthStatus === "online" && sId) {
        const payload = {
          ...analysis,
          image_base64: imageBase64,
          image_provided: true,
          target_crop: cropName
        }
        finalResult = await api.step(payload, taskId, sId)
      } else {
        // Mock result
        finalResult = {
          observation: obs,
          reward: analysis.confidence * (Math.random() * 0.2 + 0.8),
          done: true,
          info: { 
            simulated: true, 
            true_diagnosis: (obs as any).true_diagnosis,
            true_urgency: (obs as any).true_urgency
          }
        }
      }

      set({ 
        lastResult: finalResult, 
        isAnalyzing: false, 
        analysisSteps: get().analysisSteps.map(s => ({ ...s, status: "complete" })) 
      })

      // Update History
      const historyId = crypto.randomUUID()
      useHistoryStore.getState().addEpisode({
        id: historyId,
        taskId: taskId,
        crop: cropName,
        region: obs.region,
        reward: finalResult.reward,
        urgency: analysis.urgency,
        payload: analysis as any,
        info: finalResult.info,
        timestamp: new Date().toISOString(),
        hasImage: true,
        imageThumbnail: imageBase64, // using full b64 as thumb for now
        aiAnalysis: analysis
      })

    } catch (e) {
      set({ error: "Final verification failed.", isAnalyzing: false })
    }
  }
}))
