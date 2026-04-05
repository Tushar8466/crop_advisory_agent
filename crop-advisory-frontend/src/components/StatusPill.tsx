"use client"
import { cn } from "@/lib/utils"

interface StatusPillProps {
  status: "online" | "offline" | "loading"
}

export function StatusPill({ status }: StatusPillProps) {
  if (status === "loading") {
    return (
      <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">NEGOTIATING...</span>
      </div>
    )
  }

  if (status === "online") {
    return (
      <div className="flex items-center gap-3 px-5 py-2.5 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-200/50 dark:border-green-900/30 backdrop-blur-md shadow-lg shadow-green-500/5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-500">Agent Online</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-5 py-2.5 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200/50 dark:border-red-900/30 backdrop-blur-md shadow-lg shadow-red-500/5">
      <span className="relative flex h-2 w-2">
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-500">Core Offline</span>
    </div>
  )
}
