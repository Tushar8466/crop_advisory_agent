"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { getRewardColor, cn } from "@/lib/utils"
import { gsap } from "gsap"

interface RewardRingProps {
  reward: number // 0 to 1
  size?: number
  className?: string
}

export function RewardRing({ reward, size = 200, className }: RewardRingProps) {
  const circleRef = useRef<SVGCircleElement>(null)
  const [displayScore, setDisplayScore] = useState(0)
  
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the ring
      gsap.fromTo(circleRef.current, 
        { strokeDashoffset: circumference },
        { 
          strokeDashoffset: circumference * (1 - reward),
          duration: 1.5,
          ease: "power2.out",
          delay: 0.2
        }
      )

      // Count up the number
      const obj = { val: 0 }
      gsap.to(obj, {
        val: reward * 100,
        duration: 1.5,
        ease: "power2.out",
        delay: 0.2,
        onUpdate: () => setDisplayScore(Math.round(obj.val))
      })
    })

    return () => ctx.revert()
  }, [reward, circumference])

  const color = getRewardColor(reward)
  const label = reward >= 0.7 ? "EXCELLENT" : reward >= 0.4 ? "GOOD" : reward >= 0.2 ? "FAIR" : "POOR"

  return (
    <div className={cn("relative flex items-center justify-center flex-col", className)} style={{ width: size, height: size }}>
      <svg className="absolute top-0 left-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          className="text-muted/20"
          strokeWidth="10"
          fill="none"
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          fill="none"
          className="reward-ring"
        />
      </svg>
      
      <div className="flex flex-col items-center justify-center z-10 text-center select-none">
        <div className="relative">
          <span className="text-6xl font-black text-foreground drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {displayScore}
            <span className="text-2xl ml-1 font-bold text-muted-foreground">%</span>
          </span>
        </div>
        <div className="mt-2 text-[10px] font-black uppercase tracking-[0.3em]" style={{ color }}>
          {label}
        </div>
      </div>
    </div>
  )
}

