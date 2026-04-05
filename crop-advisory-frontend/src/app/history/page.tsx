"use client"
import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useHistoryStore } from "@/store/historyStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { RewardBreakdown } from "@/components/RewardBreakdown"
import { Download, Trash2, Search, ChevronRight, Calendar, ImageIcon, Activity, MapPin, Clock, FlaskConical, CalendarDays, ExternalLink, Target, Loader2 } from "lucide-react"
import { CROP_EMOJI, getRewardColor, cn } from "@/lib/utils"
import type { Episode, TaskId } from "@/types"

function HistoryContent() {
  const router = useRouter()
  const { episodes, clearHistory, exportCSV } = useHistoryStore()
  
  const [taskFilter, setTaskFilter] = useState<TaskId | "all">("all")
  const [search, setSearch] = useState("")
  const [selectedEp, setSelectedEp] = useState<Episode | null>(null)

  const filtered = episodes.filter(ep => {
    if (taskFilter !== "all" && ep.taskId !== taskFilter) return false
    if (search && !ep.crop.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (episodes.length === 0) {
    return (
      <div className="container mx-auto p-10 pt-32 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-secondary rounded-[40px] flex items-center justify-center mb-8 border border-border shadow-2xl relative group">
           <Calendar className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
           <div className="absolute -inset-2 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">NO MISSIONS LOGGED_</h2>
        <p className="text-muted-foreground mb-8 max-w-xs font-medium text-sm leading-relaxed">Your AI diagnostic history will appear here once you complete a crop analysis mission.</p>
        <Button onClick={() => router.push("/episode")} className="bg-primary hover:bg-primary/90 text-background font-black uppercase tracking-[0.2em] px-12 h-16 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95">
          START FIRST MISSION
        </Button>
      </div>
    )
  }

  const urgencyPill = (urg: string) => {
    switch (urg?.toLowerCase()) {
      case "critical": return <div className="bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">CRITICAL</div>
      case "high": return <div className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">HIGH</div>
      case "medium": return <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">MEDIUM</div>
      case "low": return <div className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">LOW</div>
      default: return null
    }
  }

  return (
    <div className="container mx-auto p-6 lg:p-10 pt-24 space-y-10 max-w-7xl">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2 italic">
            MISSION <span className="text-primary NOT-italic">LOGS</span>
          </h1>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">
            Historical Archive of Regional AI Diagnostics
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={exportCSV} className="rounded-full border-border bg-secondary/30 font-black text-[10px] uppercase tracking-[0.2em] gap-2 h-14 px-8 hover:bg-secondary transition-all">
            <Download className="w-4 h-4" /> EXPORT_CSV
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/10 font-black text-[10px] uppercase tracking-[0.2em] h-14 px-8 shadow-lg shadow-destructive/5">
                <Trash2 className="w-4 h-4" /> PURGE_ARCHIVE
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[40px] border-border bg-[#0d150d] p-10">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-black uppercase tracking-[0.2em] text-2xl italic">DANGER ZONE_</AlertDialogTitle>
                <AlertDialogDescription className="font-medium text-muted-foreground mt-2">
                  This will permanently delete all {episodes.length} logged diagnostic missions. This action cannot be reversed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-8 gap-4">
                <AlertDialogCancel className="rounded-full font-black uppercase text-[10px] tracking-widest px-8">CANCEL</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory} className="bg-destructive hover:bg-destructive/90 text-white rounded-full font-black uppercase text-[10px] tracking-widest px-8">CONFIRM PURGE</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-card border border-border p-6 rounded-[40px] shadow-2xl flex flex-col lg:flex-row gap-6 items-center">
        <div className="p-1.5 bg-secondary rounded-full flex gap-1 w-full lg:w-auto">
          {["all", "task1_diagnose", "task2_recommend", "task3_plan"].map((t) => (
            <button
              key={t}
              onClick={() => setTaskFilter(t as any)}
              className={cn(
                "px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all min-w-[100px]",
                taskFilter === t ? "bg-background text-primary shadow-xl border border-border" : "text-muted-foreground hover:text-white"
              )}
            >
              {t === "all" ? "SHOW ALL" : t.split("_")[1].toUpperCase()}
            </button>
          ))}
        </div>
        
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by crop species name..." 
            className="pl-16 h-16 bg-secondary border-border rounded-full font-black focus:ring-primary/20 text-sm tracking-widest" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-card border border-border rounded-[40px] shadow-2xl overflow-hidden border-l-[12px] border-l-primary/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/50 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border">
                <th className="px-10 py-8">ID</th>
                <th className="px-10 py-8">CROP</th>
                <th className="px-10 py-8">TASK</th>
                <th className="px-10 py-8">AI DIAGNOSIS</th>
                <th className="px-10 py-8">URGENCY</th>
                <th className="px-10 py-8">SCORE</th>
                <th className="px-10 py-8">TIME</th>
                <th className="px-10 py-8 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((ep) => (
                <tr 
                  key={ep.id} 
                  onClick={() => setSelectedEp(ep)}
                  className="group hover:bg-secondary cursor-pointer transition-colors"
                >
                  <td className="px-10 py-8 font-mono text-[10px] text-muted-foreground group-hover:text-primary">
                    {ep.id.split("-")[0].toUpperCase()}
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-black border border-border overflow-hidden relative flex items-center justify-center shrink-0">
                        {ep.imageThumbnail ? (
                          <img src={ep.imageThumbnail} alt="Thumb" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground opacity-20" />
                        )}
                        {ep.hasImage && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />}
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-white italic">{ep.crop}</span>
                        <div className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1 opacity-50">
                           <MapPin className="w-2.5 h-2.5" /> {ep.region}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full border",
                      ep.taskId === "task1_diagnose" ? "bg-primary/5 text-primary border-primary/20" :
                      ep.taskId === "task2_recommend" ? "bg-amber-500/5 text-amber-500 border-amber-500/20" : "bg-destructive/5 text-destructive border-destructive/20"
                    )}>
                      {ep.taskId.split("_")[1].toUpperCase()}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest text-white italic">
                          {ep.aiAnalysis?.diagnosis.replace(/_/g, ' ') || "PENDING_"}
                       </span>
                       <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                          {ep.aiAnalysis?.diagnosis_category || "UNKNOWN"}
                       </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    {urgencyPill(ep.aiAnalysis?.urgency || "low")}
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-12 bg-secondary rounded-full overflow-hidden hidden xl:block">
                         <div className="h-full transition-all duration-1000" style={{ width: `${ep.reward * 100}%`, backgroundColor: getRewardColor(ep.reward) }} />
                      </div>
                      <span className="text-xs font-black" style={{ color: getRewardColor(ep.reward) }}>
                        {(ep.reward * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-muted-foreground text-[10px] uppercase font-black tracking-widest">
                    {new Date(ep.timestamp).toLocaleDateString()} <br/>
                    <span className="opacity-40">{new Date(ep.timestamp).toLocaleTimeString()}</span>
                  </td>
                  <td className="px-10 py-8 text-right">
                     <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary border border-border group-hover:border-primary/50 group-hover:scale-110 transition-all">
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-32 text-center text-muted-foreground font-black uppercase text-[10px] tracking-[0.5em] italic opacity-40">NO MISSIONS MATCHING CRITERIA_</div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedEp} onOpenChange={(open) => !open && setSelectedEp(null)}>
        <DialogContent className="max-w-4xl border-border bg-[#0a0f0a] rounded-[40px] p-0 overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.1)]">
          {selectedEp && (
            <div className="flex flex-col h-[90vh]">
              <div className="p-10 border-b border-border bg-secondary/30 relative">
                <div className="absolute top-0 right-0 p-10 opacity-3">
                   <Activity className="w-32 h-32 text-primary" />
                </div>
                <DialogHeader>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{CROP_EMOJI[selectedEp.crop.toLowerCase()] || "🌱"}</span>
                        <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-1">MISSION LOG_{selectedEp.id.split('-')[0].toUpperCase()}</p>
                          <DialogTitle className="text-5xl font-black uppercase tracking-tighter italic text-white leading-none">
                            {selectedEp.crop}
                          </DialogTitle>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> {selectedEp.region}</span>
                        <span className="opacity-20">|</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> {new Date(selectedEp.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="bg-secondary p-6 rounded-3xl border border-border text-center min-w-[160px]">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">AGENT ACCURACY</p>
                       <p className="text-5xl font-black italic" style={{ color: getRewardColor(selectedEp.reward) }}>
                          {(selectedEp.reward * 100).toFixed(0)}%
                       </p>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   {/* CAPTURED VISUALS */}
                   <div className="space-y-6">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                         <ImageIcon className="w-4 h-4" /> CAPTURED_VISUALS
                      </h4>
                      <div className="aspect-square bg-black border border-border rounded-[40px] overflow-hidden group relative shadow-2xl">
                         {selectedEp.imageThumbnail ? (
                           <img src={selectedEp.imageThumbnail} alt="Mission Capture" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center opacity-10">
                              <ImageIcon className="w-20 h-20" />
                           </div>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                         <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-background/50 backdrop-blur-md rounded-full border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">SCANNING_ACTIVE</span>
                         </div>
                      </div>
                   </div>

                   {/* AI DIAGNOSTIC REPORT */}
                   <div className="space-y-8">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                         <Activity className="w-4 h-4" /> AI_DIAGNOSTIC_REPORT
                      </h4>
                      
                      <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-secondary/50 rounded-3xl border border-border">
                               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">DIAGNOSIS</p>
                               <p className="text-lg font-black text-white italic capitalize">{selectedEp.aiAnalysis?.diagnosis.replace(/_/g, ' ') || "UNKNOWN"}</p>
                            </div>
                            <div className="p-6 bg-secondary/50 rounded-3xl border border-border">
                               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">CATEGORY</p>
                               <p className="text-lg font-black text-white italic capitalize">{selectedEp.aiAnalysis?.diagnosis_category || "UNKNOWN"}</p>
                            </div>
                            <div className="p-6 bg-secondary/50 rounded-3xl border border-border">
                               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">URGENCY</p>
                               <div className="mt-1">{urgencyPill(selectedEp.aiAnalysis?.urgency || "low")}</div>
                            </div>
                            <div className="p-6 bg-secondary/50 rounded-3xl border border-border">
                               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">CONFIDENCE</p>
                               <p className="text-lg font-black text-primary">{(selectedEp.aiAnalysis?.confidence || 0 * 100).toFixed(0)}%</p>
                            </div>
                         </div>

                         {selectedEp.aiAnalysis?.treatment && (
                            <div className="p-6 bg-secondary/50 rounded-3xl border border-border space-y-3">
                               <div className="flex items-center gap-2 py-1 border-b border-white/5 mb-2">
                                  <FlaskConical className="w-4 h-4 text-amber-500" />
                                  <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">TREATMENT_PROTOCOL</h5>
                               </div>
                               <p className="text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                  {selectedEp.aiAnalysis.treatment}
                               </p>
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                {selectedEp.aiAnalysis?.season_plan && (
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2 leading-none">
                       <CalendarDays className="w-4 h-4" /> SEASONAL_EXECUTION_ROADMAP
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {selectedEp.aiAnalysis.season_plan.map((step, i) => (
                         <div key={i} className="flex gap-4 items-center p-5 bg-secondary/30 rounded-3xl border border-border/50">
                            <span className="text-lg font-black font-mono text-primary/40 bg-secondary px-3 py-1 rounded-xl border border-border/10">
                               {String(i + 1).padStart(2, "0")}
                            </span>
                            <p className="text-[11px] font-bold text-foreground/80">{step}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                     <Target className="w-4 h-4" /> PERFORMANCE_BREAKDOWN
                  </h4>
                  <RewardBreakdown info={selectedEp.info} />
                </div>

                {/* RAW TELEMETRY */}
                <div className="p-1 border border-border rounded-3xl bg-secondary relative group overflow-hidden">
                   <div className="p-6 bg-black/40 rounded-[28px] space-y-4">
                      <div className="flex items-center justify-between">
                         <h5 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-80">RAW_AI_TELEMETRY</h5>
                         <ExternalLink className="w-3 h-3 text-muted-foreground opacity-20" />
                      </div>
                      <pre className="text-[10px] font-mono text-muted-foreground overflow-x-auto p-4 bg-black/60 rounded-xl max-h-[150px]">
                         {selectedEp.aiAnalysis?.raw_response || "TELEMETRY_DATA_ABSENT"}
                      </pre>
                   </div>
                </div>
              </div>

              <div className="p-10 bg-secondary/50 border-t border-border flex justify-end gap-6">
                 <Button onClick={() => setSelectedEp(null)} className="h-16 px-12 rounded-full bg-primary hover:bg-primary/90 text-background font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95">
                    CLOSE REPORT_
                 </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>}>
      <HistoryContent />
    </Suspense>
  )
}
