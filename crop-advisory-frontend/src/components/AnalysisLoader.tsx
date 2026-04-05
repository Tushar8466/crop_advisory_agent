"use client"
import { Check, Loader2, Circle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  label: string
  status: "pending" | "loading" | "complete" | "error"
}

interface AnalysisLoaderProps {
  steps: Step[]
}

export function AnalysisLoader({ steps }: AnalysisLoaderProps) {
  return (
    <div className="bg-card/50 border border-border p-10 rounded-[40px] space-y-10 shadow-2xl relative overflow-hidden group">
      {/* SCANNING BAR ANIMATION */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-primary animate-scan-line opacity-20 pointer-events-none" />
      
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative">
           <Loader2 className="w-8 h-8 text-primary animate-spin" />
           <div className="absolute -inset-2 bg-primary/5 rounded-full animate-ping opacity-40 shrink-0" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-[0.2em] italic text-white italic">AI CORE_IS ANALYZING</h3>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">HEURISTIC_DIAGNOSTIC_PROTOCOL_ALPHA</p>
      </div>

      <div className="space-y-6 max-w-xs mx-auto">
        {steps.map((step) => (
          <div key={step.id} className={cn(
            "flex items-center gap-4 py-2 transition-all duration-500",
            step.status === "pending" ? "opacity-30 blur-[2px]" : "opacity-100 blur-0"
          )}>
            <div className={cn(
              "shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-500",
              step.status === "complete" ? "bg-primary border-primary text-background scale-110" :
              step.status === "loading"  ? "bg-secondary border-primary/50 text-primary shadow-[0_0_12px_rgba(34,197,94,0.3)] scale-100" :
              step.status === "error"    ? "bg-destructive border-destructive text-white" :
              "bg-secondary border-border text-muted-foreground"
            )}>
              {step.status === "complete" ? <Check className="w-3.5 h-3.5 stroke-[4]" /> :
               step.status === "loading"  ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
               step.status === "error"    ? <AlertCircle className="w-3.5 h-3.5" /> : 
               <Circle className="w-2 h-2 fill-current opacity-30" />}
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest transition-colors",
              step.status === "complete" ? "text-primary" :
              step.status === "loading"  ? "text-white" :
              "text-muted-foreground"
            )}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-secondary/80 border border-border rounded-3xl">
         <p className="text-[9px] font-mono text-muted-foreground leading-relaxed text-center opacity-80">
            PROCESSING_IMAGE_TENSORS... <br/>
            EXTRACTING_ENVIRONMENTAL_VECTORS... <br/>
            IDENTIFYING_PLANT_SYMPTOMATIC_PATTERNS...
         </p>
      </div>
    </div>
  )
}
