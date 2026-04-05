"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Episode } from "@/types"

interface HistoryStore {
  episodes: Episode[]
  addEpisode: (ep: Episode) => void
  clearHistory: () => void
  exportCSV: () => void
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      episodes: [],

      addEpisode: (ep) => {
        // Thumbnail is already expected to be small (e.g. 50x50 or similar)
        set((state) => ({ episodes: [ep, ...state.episodes].slice(0, 100) }))
      },

      clearHistory: () => set({ episodes: [] }),

      exportCSV: () => {
        const { episodes } = get()
        const header = "id,taskId,crop,region,reward,urgency,hasImage,timestamp"
        const rows = episodes.map(e =>
          `${e.id},${e.taskId},${e.crop},${e.region},${e.reward},${e.urgency},${e.hasImage},${e.timestamp}`
        )
        const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "crop_advisory_history.csv"
        a.click()
      },
    }),
    { name: "crop-advisory-history" }
  )
)
