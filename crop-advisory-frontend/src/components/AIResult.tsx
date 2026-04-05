"use client"
import { useEnvStore } from "@/store/envStore"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  CheckCircle, 
  ChevronRight, 
  RotateCcw, 
  History, 
  Clock, 
  Zap, 
  Award, 
  MapPin, 
  Sprout, 
  ChevronDown, 
  AlertTriangle,
  ImageIcon,
  FlaskConical,
  CalendarDays,
  Activity,
  Target
} from "lucide-react"
import { cn, getRewardColor } from "@/lib/utils"
import Link from "next/link"

export function AIResult() {
  const { aiAnalysis: res, lastResult: grade, currentTask: taskId, cropName, resetEpisode, imageBase64 } = useEnvStore()

  if (!res || !grade) return null

  const isSimulated = grade.info.simulated

  const urgencyPill = (urg: string) => {
    switch (urg?.toLowerCase()) {
      case "critical": return <div className="bg-destructive text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-[0_0_12px_rgba(239,68,68,0.4)]">🔴 CRITICAL</div>
      case "high": return <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">🟠 HIGH</div>
      case "medium": return <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">🟡 MEDIUM</div>
      case "low": return <div className="bg-primary text-background px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">🟢 LOW</div>
      default: return null
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {/* AI RESULT CARD */}
      <Card className="bg-emerald-950/20 backdrop-blur-3xl border border-emerald-500/20 rounded-[40px] overflow-hidden shadow-2xl relative border-l-[8px] border-l-primary ring-1 ring-emerald-500/10">
        
        {/* HEADER */}
        <div className="p-8 border-b border-border bg-secondary/30 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-black border border-border overflow-hidden relative flex items-center justify-center shrink-0">
                 {imageBase64 ? (
                   <img src={imageBase64} alt="Analyzed Crop" className="w-full h-full object-cover" />
                 ) : (
                   <ImageIcon className="w-8 h-8 text-muted-foreground opacity-30" />
                 )}
                 <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              </div>
              <div>
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">AI_ANALYSIS_COMPLETE</span>
                    {isSimulated && <span className="text-[9px] font-black bg-secondary border border-border text-muted-foreground px-2 py-0.5 rounded uppercase tracking-widest">(SIMULATION)</span>}
                 </div>
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">{cropName}</h2>
              </div>
           </div>
           
           <div className="hidden md:flex flex-col items-end gap-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">TASK_LEVEL</span>
              <div className={cn(
                "px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest",
                taskId === "task1_diagnose" ? "border-primary text-primary" :
                taskId === "task2_recommend" ? "border-amber-500 text-amber-500" : "border-destructive text-destructive"
              )}>
                {taskId === "task1_diagnose" ? "DIAGNOSE [EASY]" : taskId === "task2_recommend" ? "ADVISE [MEDIUM]" : "PLAN [HARD]"}
              </div>
           </div>
        </div>

        {/* BODY */}
        <div className="p-10 space-y-12">
           
           {/* SECTION 1: PROBLEM */}
           <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4" /> PROBLEM_DETECTED
                 </h3>
                 {urgencyPill(res.urgency)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">DIAGNOSIS</p>
                    <p className="text-2xl font-black text-white italic capitalize">{res.diagnosis.replace(/_/g, ' ')}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">CATEGORY</p>
                    <p className="text-2xl font-black text-white italic capitalize">{res.diagnosis_category}</p>
                 </div>
              </div>
           </div>

           {/* SECTION 2: ADVISE (Task 2 and 3) */}
           {(taskId === "task2_recommend" || taskId === "task3_plan") && res.treatment && (
             <div className="space-y-6 animate-in slide-in-from-left duration-500">
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500/80 flex items-center gap-2">
                     <FlaskConical className="w-4 h-4" /> AGENT_RECOMMENDED_TREATMENT
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Clock className="w-3 h-3" /> FOLLOW_UP: {res.follow_up_days} DAYS
                  </div>
               </div>
               <div className="bg-secondary/50 border border-border p-8 rounded-3xl relative group">
                  <p className="font-mono text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {res.treatment}
                  </p>
                  <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Zap className="w-16 h-16 text-amber-500" />
                  </div>
               </div>
             </div>
           )}

           {/* SECTION 3: PLAN (Task 3 only) */}
           {taskId === "task3_plan" && res.season_plan && (
             <div className="space-y-6 animate-in slide-in-from-left duration-700">
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/80 flex items-center gap-2">
                     <CalendarDays className="w-4 h-4" /> SEASONAL_RESILIENCE_PLAN
                  </h3>
               </div>
               <div className="grid grid-cols-1 gap-4">
                  {res.season_plan.map((step, i) => (
                    <div key={i} className="flex gap-6 items-start p-6 bg-secondary/30 rounded-3xl border border-border/50 group transition-all hover:bg-secondary hover:border-primary/20">
                       <span className="shrink-0 text-xl font-black font-mono text-primary group-hover:scale-110 transition-transform">
                         {String(i + 1).padStart(2, "0")}
                       </span>
                       <p className="text-sm font-bold text-foreground/80 pt-1">
                          {step}
                       </p>
                    </div>
                  ))}
               </div>
             </div>
           )}

           {/* CONFIDENCE BAR */}
           <div className="pt-6 border-t border-border">
              <div className="flex justify-between items-center mb-3">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI_CONFIDENCE_SCORE</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary">{(res.confidence * 100).toFixed(0)}%</p>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-border">
                 <div className="h-full bg-primary shadow-[0_0_12px_rgba(34,197,94,0.5)] transition-all duration-1000" style={{ width: `${res.confidence * 100}%` }} />
              </div>
           </div>
        </div>
      </Card>

      {/* REWARD SCORE COMPONENT (For judges/hackathon) */}
      <Card className="bg-card/50 border border-border rounded-[40px] p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
         <div className="relative shrink-0 w-24 h-24">
            <svg className="w-full h-full -rotate-90">
               <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary" />
               <circle 
                  cx="48" cy="48" r="40" 
                  stroke={getRewardColor(grade.reward)} 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - grade.reward)}`}
                  className="transition-all duration-1000 ease-out"
               />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
               <span className="text-2xl font-black" style={{ color: getRewardColor(grade.reward) }}>{(grade.reward * 100).toFixed(0)}</span>
               <span className="text-[8px] font-black opacity-40 -mt-1">%</span>
            </div>
         </div>
         <div className="text-center md:text-left">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-1">AGENT_ACCURACY_SCORE</h4>
            <p className="text-muted-foreground text-[10px] font-medium leading-relaxed max-w-sm">
               This score measures how well the AI model analyzed the symptoms compared to ground truth diagnostic protocols.
            </p>
         </div>
         <div className="ml-auto hidden md:block px-6 py-3 bg-secondary rounded-2xl border border-border">
            <Target className="w-5 h-5 text-muted-foreground opacity-30 mx-auto mb-2" />
            <p className="text-[8px] font-black text-muted-foreground uppercase text-center opacity-40">MISSION_VERIFIED</p>
         </div>
      </Card>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-4">
         <Button onClick={() => resetEpisode()} className="flex-1 h-14 rounded-full bg-secondary hover:bg-secondary/80 border border-border font-black uppercase tracking-widest gap-2">
            <RotateCcw className="w-4 h-4" /> ANALYZE ANOTHER CROP
         </Button>
         <Link href="/history" className="flex-1">
            <Button variant="outline" className="w-full h-14 rounded-full border-primary/20 hover:bg-primary/5 text-primary font-black uppercase tracking-widest gap-2">
               <History className="w-4 h-4" /> VIEW HISTORY LOGS
            </Button>
         </Link>
      </div>

    </div>
  )
}
