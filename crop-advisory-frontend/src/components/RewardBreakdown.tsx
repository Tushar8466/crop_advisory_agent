"use client"
import { cn, getRewardColor } from "@/lib/utils"

interface BreakdownItemProps {
  label: string
  predicted: string
  truth: string
  score: number
}

function BreakdownItem({ label, predicted, truth, score }: BreakdownItemProps) {
  const color = getRewardColor(score)
  
  return (
    <div className="p-6 rounded-2xl bg-secondary/30 border border-border space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-xs font-black" style={{ color }}>{(score * 10).toFixed(1)}/10.0</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60">PREDICTED</p>
          <p className="text-sm font-bold text-foreground/80 truncate">{predicted}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-tighter text-primary/60">TRUE ANSWER</p>
          <p className="text-sm font-bold text-primary truncate">{truth}</p>
        </div>
      </div>

      <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-1000" 
          style={{ 
            width: `${score * 100}%`,
            backgroundColor: color
          }} 
        />
      </div>
    </div>
  )
}

export function RewardBreakdown({ info }: { info: Record<string, any> }) {
  // Extract graded components from info
  // The backend returns keys like 'diagnosis_score', 'urgency_score' etc or nested 'breakdown'
  const breakdown = info.breakdown || {}
  const entries = Object.entries(breakdown).filter(([key]) => key.endsWith('_score') || key === 'diagnosis' || key === 'urgency' || key === 'logic')

  return (
    <div className="space-y-4">
      {entries.map(([key, data]: [string, any]) => {
        // Handle different data structures (simple score or object with predicted/true)
        const score = typeof data === 'number' ? data : (data.score ?? 0)
        const predicted = data.predicted ?? "N/A"
        const truth = data.true ?? (data.truth ?? "N/A")
        const label = key.replace('_score', '').toUpperCase()

        return (
          <BreakdownItem 
            key={key}
            label={label}
            predicted={predicted}
            truth={truth}
            score={score}
          />
        )
      })}
      
      {entries.length === 0 && (
         <div className="p-8 text-center bg-secondary/20 rounded-2xl border border-dashed border-border">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detailed breakdown unavailable for simulated data</p>
         </div>
      )}
    </div>
  )
}

