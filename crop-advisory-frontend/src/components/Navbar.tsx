"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useEnvStore } from "@/store/envStore"
import { useHealth } from "@/hooks/useHealth"
import { cn } from "@/lib/utils"
import { Sun, Moon, Sprout, Menu, Wifi, WifiOff } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const healthStatus = useEnvStore((state) => state.healthStatus)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  useHealth()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!mounted) return null

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/episode", label: "Run Episode" },
    { href: "/history", label: "History" },
    { href: "/settings", label: "Settings" }
  ]

  return (
    <>
      <header className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        isScrolled 
          ? "bg-background/95 backdrop-blur-md border-b border-border h-16" 
          : "bg-transparent h-24"
      )}>
        <div className="container mx-auto px-10 h-full flex items-center justify-between relative">
          
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
             <div className={cn(
               "p-2.5 backdrop-blur-md rounded-2xl border transition-all",
               isScrolled 
                ? "bg-primary/10 border-primary/20 group-hover:bg-primary/20" 
                : "bg-white/10 border-white/20 group-hover:bg-primary/20"
             )}>
               <Sprout className={cn(
                 "h-6 w-6 transition-colors filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]",
                 isScrolled ? "text-primary" : "text-white group-hover:text-primary"
               )} />
             </div>
             <span className={cn(
               "text-xl font-black tracking-tighter uppercase italic transition-colors",
               isScrolled ? "text-foreground" : "text-white"
             )}>
               Crop <span className="text-primary NOT-italic">Advisory</span>
             </span>
          </Link>

          {/* Navigation - Centered */}
          <nav className={cn(
            "absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-1 p-1 backdrop-blur-xl rounded-full border transition-all",
            isScrolled 
              ? "bg-secondary/80 border-border" 
              : "bg-black/40 border-white/10"
          )}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                  pathname === link.href 
                    ? (isScrolled ? "bg-primary text-primary-foreground shadow-lg" : "bg-white/10 text-primary shadow-xl border border-white/5")
                    : (isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/40 hover:text-white")
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-8">
            {/* Status Pill */}
            <div className={cn(
              "flex items-center gap-3 px-5 py-2 rounded-full border backdrop-blur-md transition-all shadow-sm",
              healthStatus === "online" 
                ? "bg-primary/10 border-primary/30" 
                : "bg-destructive/10 border-destructive/30"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                healthStatus === "online" 
                  ? "bg-primary animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]" 
                  : "bg-destructive shadow-[0_0_10px_rgba(239,68,68,1)]"
              )} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.3em]",
                healthStatus === "online" ? "text-primary" : "text-destructive"
              )}>
                {healthStatus === "online" ? "CONNECTED" : "DISCONNECTED"}
              </span>
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "p-3 rounded-full border transition-all hover:scale-110 shadow-lg active:scale-95 group",
                isScrolled 
                  ? "bg-background border-border text-foreground hover:border-primary/50" 
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              )}
            >
              {theme === "dark" 
                ? <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform" /> 
                : <Moon className="w-5 h-5 text-indigo-500 group-hover:-rotate-12 transition-transform" />
              }
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
