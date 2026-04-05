"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useHistoryStore } from "@/store/historyStore"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Sprout, 
  ChevronRight, 
  History, 
  TrendingUp, 
  Award, 
  MapPin, 
  Activity, 
  ArrowRight, 
  ImageIcon,
  FlaskConical,
  CalendarDays,
  Target,
  Scan,
  Zap,
  Loader2,
  Microscope
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { cn, getRewardColor } from "@/lib/utils"

export default function Dashboard() {
  const { episodes } = useHistoryStore()
  const [isNeuralMode, setIsNeuralMode] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  const avgReward = episodes.length > 0 
    ? episodes.reduce((acc, ep) => acc + ep.reward, 0) / episodes.length 
    : 0

  const bestScore = episodes.length > 0 
    ? Math.max(...episodes.map(e => e.reward)) 
    : 0

  const chartData = episodes.slice(0, 10).reverse().map((ep, i) => ({
    name: `M${i+1}`,
    reward: ep.reward
  }))

  const quickStartTasks = [
    {
      id: "task1_diagnose",
      title: "DIAGNOSE",
      difficulty: "EASY",
      icon: Scan,
      color: "border-primary text-primary",
      description: "Upload a photo → AI identifies the disease, pest or nutrient deficiency.",
      weights: "Diagnosis only",
      cta: "START AI DIAGNOSIS",
      buttonColor: "bg-primary text-background"
    },
    {
      id: "task2_recommend",
      title: "ADVISE",
      difficulty: "MEDIUM",
      icon: FlaskConical,
      color: "border-amber-500 text-amber-500",
      description: "Upload a photo → AI diagnoses + recommends treatment and product dosage.",
      weights: "Diagnosis + Treatment",
      cta: "START AI ADVISING",
      buttonColor: "bg-amber-500 text-background"
    },
    {
      id: "task3_plan",
      title: "PLAN",
      difficulty: "HARD",
      icon: CalendarDays,
      color: "border-destructive text-destructive",
      description: "Upload a photo → AI gives full diagnosis + treatment + seasonal roadmap.",
      weights: "Full Comprehensive Analysis",
      cta: "START AI PLANNING",
      buttonColor: "bg-destructive text-white"
    }
  ]

  return (
    <main className={cn("min-h-screen transition-colors duration-1000", isNeuralMode ? "bg-[#020617]" : "bg-background")}>
      
      {/* HERO SECTION - FULL SCREEN */}
      <section className="relative group overflow-hidden bg-black min-h-screen flex items-center justify-center text-center">
         {/* BACKGROUND TOGGLE */}
         <div className="absolute inset-0 z-0">
            {isNeuralMode ? (
              <div className="absolute inset-0 bg-radial-at-t from-primary/20 via-transparent to-transparent animate-pulse duration-10000" />
            ) : (
              <img 
                src="/images/crop.jpg" 
                alt="Agricultural Backdrop" 
                className="w-full h-full object-cover scale-100 transition-transform duration-4000 group-hover:scale-110"
              />
            )}
            <div className={cn("absolute inset-0 backdrop-blur-[1px]", isNeuralMode ? "bg-black" : "bg-black/50")} />
            <div className={cn("absolute inset-0 bg-linear-to-b", isNeuralMode ? "from-primary/10 via-black to-black" : "from-black/60 via-transparent to-black/80")} />
         </div>

         <div className="relative z-10 px-6 py-20 max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="space-y-4">
               <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                  Harvesting <br/>
                  Intelligence <br/>
                  <span className="text-primary NOT-italic">for Every Farmer</span>
               </h1>
               
               <p className="text-lg md:text-xl font-medium text-white/90 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                  Helping smallholder farmers overcome every challenge through 
                  elite diagnostics, precision recommendations, and automated 
                  12-month action plans.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-4">
               <Link href="/episode">
                  <Button className="h-16 px-12 rounded-full bg-primary hover:bg-primary/90 text-background font-black uppercase tracking-[0.2em] text-[11px] gap-3 shadow-2xl shadow-primary/40 transition-all hover:scale-105 active:scale-95">
                     LAUNCH_DIAGNOSIS <ArrowRight className="w-5 h-5" />
                  </Button>
               </Link>
               <Link href="/history">
                  <Button variant="outline" className="h-16 px-12 rounded-full border-white/20 bg-white/5 backdrop-blur-md text-white font-black uppercase tracking-[0.2em] text-[11px] gap-3 hover:bg-white/10 transition-all shadow-xl">
                     ACCESS_ARCHIVE <History className="w-5 h-5" />
                  </Button>
               </Link>
            </div>
         </div>

         {/* Side Toggles */}
         <div className="fixed right-0 top-1/2 -translate-y-1/2 flex flex-col gap-4 p-4 z-50">
            <button 
              onClick={() => setIsNeuralMode(!isNeuralMode)}
              className={cn(
                "p-3 rounded-xl border backdrop-blur-xl transition-all hover:scale-110 active:scale-95 group relative shadow-2xl",
                isNeuralMode 
                  ? "bg-primary border-primary text-background shadow-[0_0_25px_rgba(34,197,94,0.5)]" 
                  : (isScrolled ? "bg-secondary border-border text-muted-foreground hover:text-primary hover:border-primary/50" : "bg-white/10 border-white/20 text-white/40 hover:text-white hover:bg-white/20")
              )}
            >
               <Zap className={cn("w-5 h-5", isNeuralMode && "animate-pulse")} />
               <div className="absolute right-full mr-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 bg-black/80 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest pointer-events-none whitespace-nowrap shadow-2xl backdrop-blur-md border border-white/10 text-white">
                 Toggle Neural Mode
               </div>
            </button>
            <button className={cn(
              "p-3 rounded-xl border backdrop-blur-xl transition-all hover:scale-110 hover:shadow-xl",
              isScrolled 
                ? "bg-secondary border-border text-muted-foreground hover:text-primary" 
                : "bg-white/10 border-white/20 text-white/40 hover:text-white"
            )}>
               <Activity className="w-5 h-5" />
            </button>
         </div>

         {/* Scroll Indicator */}
         <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
            <div className="w-1 h-12 bg-linear-to-b from-primary to-transparent rounded-full" />
         </div>
      </section>

      {/* CORE PROCESSING SECTION - Bold Emerald Aesthetic */}
      <div className="container mx-auto max-w-7xl px-6 py-24">
         <div className="relative p-12 md:p-24 bg-linear-to-br from-emerald-900/90 via-emerald-950/90 to-emerald-950/95 backdrop-blur-3xl rounded-[60px] border border-emerald-500/30 overflow-hidden shadow-3xl group/core ring-1 ring-emerald-500/20">
            {/* Ambient Lighting */}
            <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-emerald-400/10 blur-[150px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none opacity-40 uppercase" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
               <div className="space-y-12">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                     <Zap className="w-3.5 h-3.5 text-primary" />
                     Workflow
                  </div>
                  
                  <h2 className="text-5xl md:text-7xl font-black text-white italic leading-[0.85] uppercase tracking-tighter">
                     The Agent <br/>
                     Processing Heart
                  </h2>

                  <div className="space-y-8">
                     {[
                       { num: "01", text: "Reset the environment to get a new random farm scenario based on real-world agricultural data." },
                       { num: "02", text: "Submit your diagnosis or treatment recommendation. Our agent calculates your reward in real-time." },
                       { num: "03", text: "Iterate and improve your agronomy score. Save your best runs to your local permanent history." }
                     ].map((item) => (
                       <div key={item.num} className="flex gap-6 group/item">
                          <span className="text-3xl font-black italic text-primary/40 group-hover/item:text-primary transition-colors">{item.num}</span>
                          <p className="text-lg font-medium text-white/60 leading-relaxed group-hover/item:text-white transition-colors">
                             {item.text}
                          </p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="relative">
                  {/* Neural Agri-Core Card */}
                  <div className="bg-emerald-900/20 backdrop-blur-2xl border border-emerald-500/30 p-12 md:p-16 rounded-[40px] shadow-3xl space-y-12 relative group/card ring-1 ring-emerald-500/20">
                     <div className="flex flex-col items-center justify-center text-center space-y-8">
                        <div className="p-8 bg-primary/10 rounded-full border border-primary/20 relative">
                           <Sprout className="w-16 h-16 text-primary filter drop-shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-pulse" />
                           <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
                        </div>
                        
                        <div className="space-y-2">
                           <h3 className="text-primary font-black uppercase tracking-[0.4em] text-xs">NEURAL AGRI-CORE ONLINE</h3>
                           <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">MISSION_READY</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                           <div className="h-full bg-primary shadow-[0_0_15px_rgba(34,197,94,0.8)] w-[75%] animate-in slide-in-from-left duration-2000" />
                        </div>
                        <div className="flex justify-between items-center px-1">
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">DATA_SYNC_PROTOCOL</span>
                           <span className="text-sm font-black text-primary">75% COMPLETE</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="container mx-auto max-w-7xl py-20 px-6 space-y-20 animate-in fade-in duration-1000">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/50 backdrop-blur-xl border-border p-8 rounded-[32px] neon-green overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-20 h-20 text-primary" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3">AGENT_ACCURACY</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-black text-white italic">{(avgReward * 100).toFixed(0)}</h2>
              <span className="text-xl font-bold text-primary">%</span>
            </div>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-border p-8 rounded-[32px] overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform text-amber-500">
               <Award className="w-20 h-20" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3">HIGHEST_SCORE</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-black text-white italic">{(bestScore * 100).toFixed(0)}</h2>
              <span className="text-xl font-bold text-amber-500">%</span>
            </div>
          </Card>

          <Card className="bg-card/50 backdrop-blur-xl border-border p-8 rounded-[32px] overflow-hidden relative group lg:col-span-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">TRAJECTORY_LOGS</p>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorReward" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="reward" stroke="#22c55e" fillOpacity={1} fill="url(#colorReward)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Quick Launch Grid */}
        <div className="space-y-10">
          <div className="flex items-center gap-4 px-2">
             <div className="px-5 py-2 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-[0.5em] text-primary">MISSION_LAUNCH_PROTOCOLS</div>
             <div className="h-px flex-1 bg-border/20" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {quickStartTasks.map((t) => (
               <Link key={t.id} href={`/episode?task=${t.id}`} className="group">
                 <Card className="bg-card border-border h-full p-11 rounded-[45px] hover:border-primary/30 transition-all duration-500 flex flex-col items-start gap-10 shadow-2xl relative overflow-hidden group-hover:scale-[1.02]">
                    <div className={cn("inline-flex items-center gap-2 px-4 py-2 border rounded-full text-[10px] font-black tracking-widest", t.color)}>
                       <t.icon className="w-3.5 h-3.5" />
                       {t.difficulty}
                    </div>
                    
                    <div className="space-y-4">
                       <h3 className="text-4xl font-black italic text-white group-hover:translate-x-2 transition-transform duration-500">{t.title}</h3>
                       <p className="text-sm text-muted-foreground leading-relaxed font-bold italic">
                         {t.description}
                       </p>
                    </div>

                    <div className="w-full space-y-8 mt-auto">
                       <div className="p-6 bg-secondary/80 border border-border rounded-[28px] group-hover:bg-secondary transition-colors">
                          <div className="flex items-center gap-2 mb-3">
                             <Target className="w-3.5 h-3.5 text-primary" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">AI_EXECUTION_DEPTH</span>
                          </div>
                          <p className="text-[10px] font-bold text-foreground/80 uppercase tracking-widest">{t.weights}</p>
                       </div>

                       <Button className={cn("w-full h-18 rounded-full group-hover:scale-[1.02] transition-all font-black uppercase tracking-[0.2em] text-[10px] gap-3 shadow-xl", t.buttonColor)}>
                         {t.cta} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                       </Button>
                    </div>
                 </Card>
               </Link>
             ))}
          </div>
        </div>

        {/* History Preview */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">RECENT_AI_DIAGNOSTICS_SUMMARY</h2>
            <Link href="/history" className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-[0.2em] transition-colors flex items-center gap-2 group">
               VIEW_COMPLETE_ARCHIVE <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <Card className="bg-card/40 backdrop-blur-xl border border-border rounded-[40px] overflow-hidden shadow-2xl">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-border bg-secondary/50">
                         <th className="p-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">CAPTURE</th>
                         <th className="p-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">SPECIE</th>
                         <th className="p-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI DIAGNOSIS</th>
                         <th className="p-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">MISSION_SCORE</th>
                         <th className="p-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">STATUS</th>
                      </tr>
                   </thead>
                   <tbody>
                      {episodes.slice(0, 5).map((ep) => (
                        <tr key={ep.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors group/row">
                           <td className="p-8">
                              <div className="w-14 h-14 rounded-2xl bg-black border border-border overflow-hidden relative flex items-center justify-center group/img">
                                 {ep.imageThumbnail ? (
                                   <img src={ep.imageThumbnail} alt="Crop" className="w-full h-full object-cover transition-transform group-hover/img:scale-110 duration-700" />
                                 ) : (
                                   <ImageIcon className="w-6 h-6 text-muted-foreground opacity-30" />
                                 )}
                                 <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(34,197,94,1)] animate-pulse" />
                              </div>
                           </td>
                           <td className="p-8">
                              <div className="font-black text-white uppercase italic tracking-tighter text-xl leading-none mb-1 group-hover/row:text-primary transition-colors">{ep.crop}</div>
                              <div className="text-[9px] font-black text-muted-foreground flex items-center gap-1 opacity-50">
                                 <MapPin className="w-3 h-3" /> {ep.region}
                              </div>
                           </td>
                           <td className="p-8">
                              <div className="text-[11px] font-black text-foreground/80 uppercase italic tracking-widest">
                                 {ep.aiAnalysis?.diagnosis.replace(/_/g, ' ') || "ANALYZED"}
                              </div>
                           </td>
                           <td className="p-8">
                              <div className="flex items-center gap-3">
                                 <div className="h-1.5 w-20 bg-secondary border border-border rounded-full overflow-hidden">
                                    <div className="h-full transition-all duration-1000" style={{ width: `${ep.reward * 100}%`, backgroundColor: getRewardColor(ep.reward) }} />
                                 </div>
                                 <span className="font-black text-sm" style={{ color: getRewardColor(ep.reward) }}>{(ep.reward * 100).toFixed(0)}%</span>
                              </div>
                           </td>
                           <td className="p-8 text-right">
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border rounded-full text-[9px] font-black text-muted-foreground group-hover/row:border-primary/30 transition-all">
                                 <div className="w-1.5 h-1.5 rounded-full bg-primary" /> VALIDATED
                              </div>
                           </td>
                        </tr>
                      ))}
                      {episodes.length === 0 && (
                        <tr>
                           <td colSpan={5} className="p-40 text-center text-muted-foreground">
                              <Sprout className="w-20 h-20 mx-auto mb-8 opacity-10" />
                              <p className="text-[12px] font-black uppercase tracking-[0.6em] italic opacity-40">SYSTEM_IDLE: NO_DIAGNOSTIC_DATA_FOUND</p>
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
