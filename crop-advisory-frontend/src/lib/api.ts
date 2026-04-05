import axios from "axios"
import type { ResetResult, StepResult, TaskId } from "@/types"

const BASE = process.env.NEXT_PUBLIC_ENV_URL ?? "http://localhost:7860"

export const api = {
  health: () =>
    axios.get(`${BASE}/health`).then(r => r.data),

  tasks: () =>
    axios.get(`${BASE}/tasks`).then(r => r.data),

  reset: (taskId: TaskId): Promise<ResetResult> =>
    axios.post(`${BASE}/reset?task_id=${taskId}`).then(r => r.data),

  step: (
    payload: Record<string, any>,
    taskId: TaskId,
    sessionId: string
  ): Promise<StepResult> =>
    axios.post(`${BASE}/step?session_id=${sessionId}`, {
      task_id: taskId,
      action_type: taskId,
      payload,
    }).then(r => r.data),

  state: (sessionId: string) =>
    axios.get(`${BASE}/state?session_id=${sessionId}`).then(r => r.data),
}
