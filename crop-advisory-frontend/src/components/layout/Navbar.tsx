"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useEnvStore } from "@/store/envStore"
import { useHealth } from "@/hooks/useHealth"
import { StatusPill } from "@/components/StatusPill"
import { cn } from "@/lib/utils"
import { Sun, Moon, Sprout, History, Settings, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const healthStatus = useEnvStore((state) => state.healthStatus)
  useHealth()

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/episode", label: "Run Episode", icon: Sprout },
    { href: "/history", label: "History", icon: History },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="container max-w-6xl w-full h-20 px-8 flex items-center justify-between rounded-[32px] bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl border border-white/20 dark:border-gray-800/50 shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="bg-linear-to-br from-green-600 to-emerald-600 text-white p-2.5 rounded-2xl shadow-xl shadow-green-600/20">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="hidden font-black sm:inline-block text-gray-950 dark:text-white uppercase tracking-tighter text-lg">
              Crop Advisory
            </span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-1 p-1.5 bg-gray-100/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200/50 dark:border-gray-800/50">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all tracking-widest uppercase",
                    isActive 
                      ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-md" 
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-800/50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:block">
            <StatusPill status={healthStatus} />
          </div>
          
          <div className="h-10 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-white dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 shadow-sm transition-all active:scale-95"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
