"use client"

import { useEffect, useState, useRef } from "react"

// Background themes that subtly transition over time
const BACKGROUND_PHASES = [
  {
    name: "twilight",
    gradient: "from-slate-950 via-purple-950 to-slate-900",
    accent1: "rgba(147, 51, 234, 0.08)",
    accent2: "rgba(59, 130, 246, 0.06)",
    orbColor1: "bg-purple-500/10",
    orbColor2: "bg-blue-500/8",
    gridOpacity: 0.03,
  },
  {
    name: "deep ocean",
    gradient: "from-slate-950 via-blue-950 to-slate-900",
    accent1: "rgba(59, 130, 246, 0.08)",
    accent2: "rgba(6, 182, 212, 0.06)",
    orbColor1: "bg-blue-500/10",
    orbColor2: "bg-cyan-500/8",
    gridOpacity: 0.025,
  },
  {
    name: "aurora",
    gradient: "from-slate-950 via-emerald-950 to-slate-900",
    accent1: "rgba(16, 185, 129, 0.08)",
    accent2: "rgba(59, 130, 246, 0.06)",
    orbColor1: "bg-emerald-500/10",
    orbColor2: "bg-teal-500/8",
    gridOpacity: 0.035,
  },
  {
    name: "cosmic",
    gradient: "from-slate-950 via-indigo-950 to-slate-900",
    accent1: "rgba(99, 102, 241, 0.08)",
    accent2: "rgba(168, 85, 247, 0.06)",
    orbColor1: "bg-indigo-500/10",
    orbColor2: "bg-violet-500/8",
    gridOpacity: 0.03,
  },
  {
    name: "sunset",
    gradient: "from-slate-950 via-rose-950 to-slate-900",
    accent1: "rgba(244, 63, 94, 0.06)",
    accent2: "rgba(251, 146, 60, 0.05)",
    orbColor1: "bg-rose-500/8",
    orbColor2: "bg-orange-500/6",
    gridOpacity: 0.025,
  },
  {
    name: "midnight",
    gradient: "from-gray-950 via-slate-950 to-gray-900",
    accent1: "rgba(100, 116, 139, 0.08)",
    accent2: "rgba(71, 85, 105, 0.06)",
    orbColor1: "bg-slate-500/10",
    orbColor2: "bg-gray-500/8",
    gridOpacity: 0.02,
  },
]

// Time between phase transitions (7 minutes = 420000ms)
const PHASE_DURATION = 420000
// Transition duration (30 seconds for smooth blending)
const TRANSITION_DURATION = 30000

interface EvolvingBackgroundProps {
  className?: string
}

export function EvolvingBackground({ className = "" }: EvolvingBackgroundProps) {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [nextPhase, setNextPhase] = useState(1)
  const [transitionProgress, setTransitionProgress] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const startTimeRef = useRef(Date.now())
  const animationFrameRef = useRef<number>()

  // Handle phase transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setNextPhase((prev) => (prev + 1) % BACKGROUND_PHASES.length)
      
      // Animate the transition
      const transitionStart = Date.now()
      const animateTransition = () => {
        const elapsed = Date.now() - transitionStart
        const progress = Math.min(elapsed / TRANSITION_DURATION, 1)
        setTransitionProgress(progress)
        
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateTransition)
        } else {
          setCurrentPhase((prev) => (prev + 1) % BACKGROUND_PHASES.length)
          setTransitionProgress(0)
          setIsTransitioning(false)
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animateTransition)
    }, PHASE_DURATION)

    return () => {
      clearInterval(interval)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const current = BACKGROUND_PHASES[currentPhase]
  const next = BACKGROUND_PHASES[nextPhase]

  // Interpolate opacity for smooth transitions
  const currentOpacity = isTransitioning ? 1 - transitionProgress : 1
  const nextOpacity = isTransitioning ? transitionProgress : 0

  return (
    <div className={`fixed inset-0 overflow-hidden ${className}`}>
      {/* Current phase background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${current.gradient} transition-opacity duration-1000`}
        style={{ opacity: currentOpacity }}
      />
      
      {/* Next phase background (for blending) */}
      {isTransitioning && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${next.gradient}`}
          style={{ opacity: nextOpacity }}
        />
      )}

      {/* Always-on drifting color wash — gives a constant, subtle sense of motion */}
      <div
        className="absolute inset-0 pointer-events-none animate-bg-drift"
        style={{
          background: `linear-gradient(120deg, ${current.accent1} 0%, transparent 35%, ${current.accent2} 65%, transparent 100%)`,
          opacity: currentOpacity,
        }}
      />

      {/* Slow diagonal aurora band that perpetually sweeps across the scene */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -inset-x-1/4 top-1/4 h-1/2 animate-aurora-sweep blur-3xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${current.accent1}, transparent)`,
          }}
        />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,${current.gridOpacity}) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,${current.gridOpacity}) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          opacity: currentOpacity,
        }}
      />

      {/* Floating orbs - current phase */}
      <div className="absolute inset-0 overflow-hidden" style={{ opacity: currentOpacity }}>
        <div
          className={`absolute w-96 h-96 rounded-full ${current.orbColor1} blur-3xl animate-float`}
          style={{
            top: "10%",
            left: "5%",
            animationDelay: "0s",
            animationDuration: "20s",
          }}
        />
        <div
          className={`absolute w-80 h-80 rounded-full ${current.orbColor2} blur-3xl animate-float`}
          style={{
            top: "60%",
            right: "10%",
            animationDelay: "-5s",
            animationDuration: "25s",
          }}
        />
        <div
          className={`absolute w-64 h-64 rounded-full ${current.orbColor1} blur-3xl animate-float`}
          style={{
            bottom: "20%",
            left: "30%",
            animationDelay: "-10s",
            animationDuration: "18s",
          }}
        />
        <div
          className={`absolute w-72 h-72 rounded-full ${current.orbColor2} blur-3xl animate-float`}
          style={{
            top: "30%",
            right: "25%",
            animationDelay: "-15s",
            animationDuration: "22s",
          }}
        />
      </div>

      {/* Floating orbs - next phase (for blending) */}
      {isTransitioning && (
        <div className="absolute inset-0 overflow-hidden" style={{ opacity: nextOpacity }}>
          <div
            className={`absolute w-96 h-96 rounded-full ${next.orbColor1} blur-3xl animate-float`}
            style={{
              top: "10%",
              left: "5%",
              animationDelay: "0s",
              animationDuration: "20s",
            }}
          />
          <div
            className={`absolute w-80 h-80 rounded-full ${next.orbColor2} blur-3xl animate-float`}
            style={{
              top: "60%",
              right: "10%",
              animationDelay: "-5s",
              animationDuration: "25s",
            }}
          />
          <div
            className={`absolute w-64 h-64 rounded-full ${next.orbColor1} blur-3xl animate-float`}
            style={{
              bottom: "20%",
              left: "30%",
              animationDelay: "-10s",
              animationDuration: "18s",
            }}
          />
        </div>
      )}

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Subtle moving light rays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          style={{
            top: "20%",
            transform: "rotate(-15deg) translateX(-50%)",
            animation: "shimmer 15s linear infinite",
          }}
        />
        <div
          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-white/3 to-transparent"
          style={{
            top: "70%",
            transform: "rotate(10deg) translateX(50%)",
            animation: "shimmer 20s linear infinite reverse",
          }}
        />
      </div>
    </div>
  )
}
