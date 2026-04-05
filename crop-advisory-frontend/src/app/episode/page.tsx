"use client"
import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEnvStore } from "@/store/envStore"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ImageUpload } from "@/components/ImageUpload"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Sprout, 
  Search, 
  Microscope, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  Scan,
  Activity,
  Zap,
  Target,
  MapPin,
  MoveDiagonal,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AnalysisLoader } from "@/components/AnalysisLoader"
import { AIResult } from "@/components/AIResult"
import type { TaskId } from "@/types"

const formSchema = z.object({
  cropName: z.string().min(2, "Crop name is required"),
  imageBase64: z.string().min(1, "Photo of your crop is required"),
  region: z.string().optional(),
  areaSize: z.string().optional(),
  severity: z.string().optional()
})

type FormData = z.infer<typeof formSchema>

function EpisodeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { 
    currentTask, 
    setCurrentTask, 
    runAnalysis, 
    isAnalyzing, 
    lastResult, 
    aiAnalysis,
    analysisSteps,
    error,
    clearError,
    setImage,
    clearImage,
    imageBase64,
    setCropName,
    cropName,
    checkHealth,
    resetEpisode
  } = useEnvStore()

  useEffect(() => {
    checkHealth()
    
    // Sync task from URL if present
    const taskParam = searchParams.get("task") as TaskId
    if (taskParam && (taskParam === "task1_diagnose" || taskParam === "task2_recommend" || taskParam === "task3_plan")) {
      setCurrentTask(taskParam)
    }
  }, [searchParams, checkHealth, setCurrentTask])

  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      cropName: "", 
      imageBase64: "",
      region: "NAIROBI_SECTOR",
      areaSize: "1.5 HECTARES",
      severity: "MODERATE"
    }
  })

  // SYNC STORE WITH FORM
  useEffect(() => {
    if (imageBase64) setValue("imageBase64", imageBase64)
  }, [imageBase64, setValue])

  const onSubmit = async (data: FormData) => {
    setCropName(data.cropName)
    await runAnalysis(currentTask)
  }

  const descriptions: Record<TaskId, string> = {
    task1_diagnose: "AI will identify what disease, pest or nutrient problem is affecting your crop from the photo.",
    task2_recommend: "AI will identify the problem and recommend a specific treatment with product names and dosage.",
    task3_plan: "AI will provide full diagnosis, treatment protocol and a complete 4-6 step seasonal action plan."
  }

  // RESULTS MODE
  if (lastResult && aiAnalysis) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <AIResult />
      </main>
    )
  }

  // ANALYSIS MODE
  if (isAnalyzing) {
    return (
      <main className="min-h-screen bg-background pt-32 pb-20 px-6 max-w-2xl mx-auto flex items-center justify-center">
        <div className="w-full">
          <AnalysisLoader steps={analysisSteps} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pt-32 pb-32 px-6 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000">
        
        {/* TASK SELECTOR */}
        <div className="flex flex-col items-center text-center space-y-12">
           <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white italic leading-none drop-shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                 AI_MISSION <br/>
                 <span className="text-primary NOT-italic">STATION</span>
              </h1>
              <div className="flex items-center justify-center gap-4">
                 <div className="h-px w-12 bg-white/10" />
                 <p className="text-[10px] font-black uppercase tracking-[0.6em] text-muted-foreground">MISSION_COMPLEXITY_LEVEL</p>
                 <div className="h-px w-12 bg-white/10" />
              </div>
           </div>
           
           <div className="w-full flex justify-center">
              <Tabs value={currentTask} onValueChange={(v) => setCurrentTask(v as TaskId)} className="w-full">
                 <TabsList className="grid grid-cols-3 w-full bg-secondary/80 backdrop-blur-xl p-2 h-28 rounded-[40px] border border-white/5 relative shadow-3xl">
                    <TabsTrigger value="task1_diagnose" className="rounded-[24px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-2xl font-black uppercase text-xs sm:text-sm tracking-[0.2em] gap-3 hover:bg-white/5 transition-all h-full">
                       <Scan className="w-6 h-6" />
                       DIAGNOSE
                    </TabsTrigger>
                    <TabsTrigger value="task2_recommend" className="rounded-[24px] data-[state=active]:bg-background data-[state=active]:text-amber-500 data-[state=active]:shadow-2xl font-black uppercase text-xs sm:text-sm tracking-[0.2em] gap-3 hover:bg-white/5 transition-all h-full">
                       <Zap className="w-6 h-6" />
                       ADVISE
                    </TabsTrigger>
                    <TabsTrigger value="task3_plan" className="rounded-[24px] data-[state=active]:bg-background data-[state=active]:text-destructive data-[state=active]:shadow-2xl font-black uppercase text-xs sm:text-sm tracking-[0.2em] gap-3 hover:bg-white/5 transition-all h-full">
                       <Target className="w-6 h-6" />
                       PLAN
                    </TabsTrigger>
                 </TabsList>
              </Tabs>
           </div>
        </div>

        {/* INFORMATION COLLECTION CARD */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 group">
           <Card className="bg-emerald-950/20 backdrop-blur-3xl border border-emerald-500/20 rounded-[60px] p-10 md:p-14 shadow-3xl space-y-12 relative overflow-hidden ring-1 ring-emerald-500/10">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] opacity-30 animate-pulse pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px] opacity-20 pointer-events-none" />
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                 <Microscope className="w-40 h-40 text-primary" />
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-8">
                 <div className="space-y-1">
                    <h2 className="text-sm font-black uppercase tracking-[0.4em] text-primary">COLLECTION_PROTOCOL</h2>
                    <p className="text-2xl font-black text-white italic tracking-tighter uppercase">DIAGNOSTIC_DATA_SYNOPSIS</p>
                 </div>
                 <div className="hidden sm:block">
                    <div className="px-5 py-2 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                       AI_READY_V4
                    </div>
                 </div>
              </div>

              <div className="space-y-12">
                 {/* Photograph */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                          <Scan className="w-4 h-4 text-primary" />
                       </div>
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">PHOTOGRAPH_VISUALS</label>
                    </div>
                    <Controller
                      control={control}
                      name="imageBase64"
                      render={({ field, fieldState }) => (
                        <ImageUpload
                          label=""
                          required
                          onImageSelect={(base64, file) => {
                             field.onChange(base64)
                             setImage(base64, file!)
                          }}
                          onImageClear={() => {
                             field.onChange("")
                             clearImage()
                          }}
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                 </div>

                 {/* Basic Info */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                          <Sprout className="w-4 h-4 text-primary" />
                       </div>
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">IDENTIFY_THE_CROP</label>
                    </div>
                    <div className="relative group/input">
                       <Input 
                         {...register("cropName")}
                         placeholder="Enter crop name..." 
                         className={cn(
                           "h-18 px-6 bg-black/40 border-white/5 rounded-2xl font-black text-lg uppercase italic tracking-tighter text-white focus:ring-primary/20 transition-all placeholder:text-white/20",
                           errors.cropName && "border-destructive/50"
                         )}
                       />
                       {errors.cropName && (
                         <p className="text-[10px] text-destructive font-black uppercase tracking-widest flex items-center gap-2 mt-3 px-2">
                            <AlertCircle className="w-4 h-4" /> {errors.cropName.message}
                         </p>
                       )}
                    </div>
                 </div>

                 {/* Field Parameters */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                    <div className="space-y-4 group/param">
                       <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-primary/40 group-focus-within/param:text-primary transition-colors" />
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">REGION</label>
                       </div>
                       <Input 
                         {...register("region")} 
                         className="h-14 bg-black/30 border-white/5 rounded-xl font-black uppercase text-xs text-white/60 focus:text-white transition-colors" 
                       />
                    </div>
                    <div className="space-y-4 group/param">
                       <div className="flex items-center gap-2">
                          <MoveDiagonal className="w-3.5 h-3.5 text-primary/40 group-focus-within/param:text-primary transition-colors" />
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">AREA_SIZE</label>
                       </div>
                       <Input 
                         {...register("areaSize")} 
                         className="h-14 bg-black/30 border-white/5 rounded-xl font-black uppercase text-xs text-white/60 focus:text-white transition-colors" 
                       />
                    </div>
                    <div className="space-y-4 group/param">
                       <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-primary/40 group-focus-within/param:text-primary transition-colors" />
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">SEVERITY</label>
                       </div>
                       <Input 
                         {...register("severity")} 
                         className="h-14 bg-black/30 border-white/5 rounded-xl font-black uppercase text-xs text-white/60 focus:text-white transition-colors" 
                       />
                    </div>
                 </div>
              </div>

              {/* ERROR DISPLAY */}
              {error && (
                <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-[32px] flex items-center gap-4 animate-shake">
                   <AlertCircle className="w-5 h-5 text-destructive" />
                   <p className="text-[10px] font-black uppercase text-destructive tracking-[0.2em]">{error}</p>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <div className="pt-8">
                 <Button 
                   type="submit" 
                   className="w-full h-24 rounded-[32px] bg-primary hover:bg-primary/90 text-background font-black uppercase tracking-[0.5em] text-sm gap-4 shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-98 relative overflow-hidden group/btn"
                 >
                    <Search className="w-7 h-7" />
                    INITIATE_DIAGNOSTIC_MISSION
                    <ChevronRight className="w-6 h-6 opacity-40 group-hover:translate-x-2 transition-transform" />
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                 </Button>
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 text-center mt-6">
                    {descriptions[currentTask]}
                 </p>
              </div>
           </Card>
        </form>

        {/* Footer info */}
        <div className="flex flex-col items-center gap-4 opacity-40">
           <div className="h-px w-20 bg-white/20" />
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white">
              SATELLITE_LINK_ACTIVE // AGRI_CORE_V4
           </p>
        </div>

     </div>
    </main>
  )
}

export default function EpisodePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>}>
      <EpisodeContent />
    </Suspense>
  )
}
