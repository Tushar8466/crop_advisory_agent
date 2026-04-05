"use client"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useEnvStore } from "@/store/envStore"
import { useHistoryStore } from "@/store/historyStore"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/useToast"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Download, Trash2, Code2, Link as LinkIcon, RefreshCw, Sun, Moon, Monitor, Wifi, Database, Settings2, ShieldCheck, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { envUrl, setEnvUrl, healthStatus, checkHealth } = useEnvStore()
  const { episodes, clearHistory, exportCSV } = useHistoryStore()
  const { toastSuccess, toastError } = useToast()
  
  const [localUrl, setLocalUrl] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => { setMounted(true); setLocalUrl(envUrl); }, [envUrl])

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      await api.health()
      toastSuccess("System connection verified")
      checkHealth()
    } catch {
      toastError("Connection refused by endpoint")
      checkHealth()
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = () => {
    setEnvUrl(localUrl)
    toastSuccess("Environment address updated")
    checkHealth()
  }

  if (!mounted) return null

  return (
    <div className="container mx-auto p-6 lg:p-10 pt-24 space-y-10 max-w-5xl">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-2">
            SYSTEM <span className="text-primary italic">CONFIG</span>
          </h1>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Neural Infrastructure & API Management
          </p>
        </div>
        <div className="flex gap-4">
           <div className={cn(
             "px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-3 bg-secondary/30",
             healthStatus === "online" ? "border-primary/20 text-primary" : "border-destructive/20 text-destructive"
           )}>
             <div className={cn("w-2 h-2 rounded-full", healthStatus === "online" ? "bg-primary" : "bg-destructive")} />
             {healthStatus === "online" ? "ACTIVE PROTOCOL" : "LINK SEVERED"}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* CONNECTION SETTINGS */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <Wifi className="w-5 h-5 text-primary" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">ENDPOINT_CONTROL</h2>
           </div>
           <Card className="p-8 bg-card border-border border-t-2 border-t-primary/30 space-y-8 rounded-[32px] shadow-2xl">
              <div className="space-y-4">
                 <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">API_ENDPOINT_URL</label>
                    <span className="text-[9px] font-mono text-muted-foreground opacity-40">NEXT_PUBLIC_ENV_URL</span>
                 </div>
                 <Input 
                   value={localUrl} 
                   onChange={(e) => setLocalUrl(e.target.value)} 
                   className="h-14 bg-secondary border-border rounded-xl font-bold font-mono focus:ring-primary/20"
                   placeholder="http://localhost:7860"
                 />
                 <div className="pt-2 flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleSave} disabled={localUrl === envUrl} className="h-14 rounded-full bg-primary hover:bg-primary/95 text-background font-black uppercase tracking-widest px-8">
                       SAVE ADDRESS
                    </Button>
                    <Button onClick={handleTestConnection} variant="ghost" disabled={isTesting} className="h-14 rounded-full border border-border font-black uppercase tracking-widest px-8 group">
                       <RefreshCw className={cn("w-4 h-4 mr-2", isTesting && "animate-spin")} />
                       TEST SIGNAL
                    </Button>
                 </div>
              </div>

              <div className="p-4 bg-secondary/50 rounded-2xl border border-border space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
                    <span>Latent Pulse</span>
                    <span className={healthStatus === "online" ? "text-primary" : "text-destructive"}>{healthStatus === "online" ? "STABLE" : "INSTABILITY"}</span>
                 </div>
                 <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-1000", healthStatus === "online" ? "bg-primary w-full" : "bg-destructive w-1/4")} />
                 </div>
              </div>
           </Card>
        </div>

        {/* DATA MANAGEMENT */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">STORAGE_MANAGEMENT</h2>
           </div>
           <Card className="p-8 bg-card border-border border-t-2 border-t-primary/30 space-y-8 rounded-[32px] shadow-2xl">
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                       <h4 className="text-sm font-black uppercase tracking-widest mb-1 text-foreground">EPISODE HISTORY</h4>
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Saved in browser localStorage</p>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 rounded-lg">
                       <span className="text-xl font-black text-primary">{episodes.length}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button onClick={exportCSV} variant="outline" className="h-14 rounded-full border-border bg-secondary font-black uppercase text-[10px] tracking-widest gap-2">
                       <Download className="w-4 h-4" /> EXPORT REPORTS
                    </Button>
                    
                    <AlertDialog>
                       <AlertDialogTrigger asChild>
                          <Button variant="outline" className="h-14 rounded-full border-destructive/20 text-destructive hover:bg-destructive/10 font-black uppercase text-[10px] tracking-widest gap-2">
                             <Trash2 className="w-4 h-4" /> PURGE CACHE
                          </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent className="rounded-[32px] border-border bg-card">
                          <AlertDialogHeader>
                             <AlertDialogTitle className="font-black uppercase tracking-[0.2em]">DESTRUCTIVE OVERWRITE</AlertDialogTitle>
                             <AlertDialogDescription className="font-medium text-muted-foreground uppercase text-[11px] tracking-tight">
                                This will purge {episodes.length} historical diagnostic records. Signal trace will be lost forever.
                             </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                             <AlertDialogCancel className="rounded-full font-black uppercase text-[10px]">RECOVER</AlertDialogCancel>
                             <AlertDialogAction onClick={() => { clearHistory(); toastSuccess("History Nuked") }} className="bg-destructive hover:bg-destructive/90 text-white rounded-full font-black uppercase text-[10px]">CONFIRM PURGE</AlertDialogAction>
                          </AlertDialogFooter>
                       </AlertDialogContent>
                    </AlertDialog>
                 </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-border">
                 <div className="p-3 bg-secondary rounded-xl">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">DATA ENCRYPTION</h4>
                    <p className="text-[9px] font-mono text-muted-foreground uppercase">LOCAL_ONLY_ACCESS_VAULT</p>
                 </div>
              </div>
           </Card>
        </div>

        {/* APPEARANCE & SYSTEM INFO */}
        <div className="space-y-6 lg:col-span-2">
           <div className="flex items-center gap-3 px-2">
              <Settings2 className="w-5 h-5 text-primary" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">PREFERENCES_&_ABOUT</h2>
           </div>
           <Card className="p-8 bg-card border-border rounded-[32px] grid grid-cols-1 md:grid-cols-2 gap-12 shadow-2xl">
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">VISUAL_MODE</h4>
                 <div className="flex gap-4 p-1 bg-secondary rounded-full w-fit">
                    {[
                      { id: "light", icon: Sun, label: "LIGHT" },
                      { id: "dark", icon: Moon, label: "DARK" },
                      { id: "system", icon: Monitor, label: "SYSTEM" }
                    ].map((mode) => (
                      <button 
                        key={mode.id}
                        onClick={() => setTheme(mode.id)}
                        className={cn(
                          "flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                          theme === mode.id ? "bg-background text-primary shadow-lg border border-border" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                         <mode.icon className="w-4 h-4" /> {mode.label}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-6 flex flex-col justify-center">
                 <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">SYSTEM_VERSION</span>
                    <span className="text-[10px] font-black text-foreground font-mono">v1.2.4_STABLE</span>
                 </div>
                 <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">BUILD_ENVIRONMENT</span>
                    <span className="text-[10px] font-black text-primary font-mono tracking-widest px-2 py-0.5 bg-primary/10 rounded uppercase">OpenEnv_Prod</span>
                 </div>
                 <div className="flex justify-between py-3">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">REGION</span>
                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest">East Africa Hub</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      <div className="flex justify-center pt-10">
         <div className="flex items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
            <a href="#" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">
               <Code2 className="w-4 h-4" /> GITHUB_REPO
            </a>
            <div className="h-1 w-1 bg-primary rounded-full transition-all" />
            <a href="#" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors">
               <Activity className="w-4 h-4" /> STATUS_PAGE
            </a>
         </div>
      </div>
    </div>
  )
}
