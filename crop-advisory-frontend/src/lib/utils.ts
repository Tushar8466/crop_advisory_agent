import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const CROP_EMOJI: Record<string, string> = {
  wheat: "🌾", rice: "🌿", maize: "🌽", tomato: "🍅",
  potato: "🥔", soybean: "🫘", banana: "🍌",
  cotton: "🧶", sugarcane: "🌱", chickpea: "🫛",
}

export const URGENCY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high:     "bg-orange-100 text-orange-800 border-orange-200",
  medium:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  low:      "bg-green-100 text-green-800 border-green-200",
}

export const CATEGORY_COLORS: Record<string, string> = {
  disease:  "bg-purple-100 text-purple-800",
  pest:     "bg-red-100 text-red-800",
  nutrient: "bg-blue-100 text-blue-800",
  abiotic:  "bg-gray-100 text-gray-800",
}

export function getRewardColor(score: number): string {
  if (score >= 0.7) return "#22c55e" // Primary Green
  if (score >= 0.4) return "#f59e0b" // Amber
  return "#ef4444" // Red
}

export function getRewardLabel(score: number): string {
  if (score >= 0.8) return "Excellent"
  if (score >= 0.6) return "Good"
  if (score >= 0.4) return "Fair"
  return "Poor"
}
