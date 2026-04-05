"use client"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CROP_EMOJI, cn } from "@/lib/utils"
import type { FarmObservation } from "@/types"
import { Thermometer, Droplets, CloudRain, Beaker, MapPin, Activity, Info, Sprout } from "lucide-react"

export function FarmCard({ observation, isLoading = false }: { observation: FarmObservation | null, isLoading?: boolean }) {
  if (isLoading || !observation) {
    return (
      <Card className="relative border-border bg-card overflow-hidden rounded-[32px] p-8 shadow-2xl h-[600px]">
        <div className="space-y-6">
          <div className="flex gap-4">
             <Skeleton className="h-16 w-16 rounded-2xl bg-secondary" />
             <div className="space-y-2">
                <Skeleton className="h-8 w-48 bg-secondary" />
                <Skeleton className="h-4 w-32 bg-secondary rounded-full" />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Skeleton className="h-24 bg-secondary rounded-2xl" />
             <Skeleton className="h-24 bg-secondary rounded-2xl" />
             <Skeleton className="h-24 bg-secondary rounded-2xl" />
             <Skeleton className="h-24 bg-secondary rounded-2xl" />
          </div>
          <Skeleton className="h-12 w-full bg-secondary rounded-full" />
          <Skeleton className="h-32 w-full bg-secondary rounded-2xl" />
          <Skeleton className="h-20 w-full bg-secondary rounded-2xl" />
        </div>
      </Card>
    )
  }

  const emoji = CROP_EMOJI[observation.crop.toLowerCase()] || "🌿"

  return (
    <Card className="relative border-border bg-card overflow-hidden rounded-[32px] p-8 shadow-2xl">
      {/* Top Header Row */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">{emoji}</span>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-primary">
              {observation.crop}
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary rounded-full border border-border">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
              {observation.region}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
            FARM ID: {observation.farm_id}
          </p>
        </div>
      </div>

      {/* Stats Grid 2x2 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: "SOIL pH", value: observation.soil_ph, icon: Beaker },
          { label: "RAINFALL mm", value: observation.rainfall_mm, icon: CloudRain },
          { label: "TEMP °C", value: observation.temperature_c, icon: Thermometer },
          { label: "HUMIDITY %", value: observation.humidity_pct, icon: Droplets }
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl bg-secondary/50 border border-border group hover:bg-secondary transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
              <stat.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-2xl font-black text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Growth Stage Chip */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-full">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-[11px] font-black uppercase tracking-widest text-primary">
            GROWTH STAGE: <span className="text-foreground">{observation.growth_stage}</span>
          </span>
        </div>
      </div>

      {/* Symptoms Block */}
      <div className="space-y-3 mb-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SYMPTOMS OBSERVED</p>
        <div className="p-6 rounded-2xl bg-secondary/30 border-l-2 border-primary/50 text-muted-foreground font-mono text-xs leading-relaxed">
          {observation.symptoms}
        </div>
      </div>

      {/* Task Description Banner */}
      <div className="p-5 rounded-2xl bg-secondary border-l-4 border-primary text-foreground/80 text-[11px] font-medium leading-relaxed flex gap-4 items-start shadow-inner">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>{observation.task_description}</p>
      </div>
    </Card>
  )
}

