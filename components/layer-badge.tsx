"use client"

import { Layers } from "lucide-react"

/**
 * Tiny visual reinforcement of the lesson the player is inside of.
 * Layer 1 = same-for-everyone. Layer 2 = flows specific to this learner.
 * Layer 3 = system that learns. The badge shows where the current screen lives.
 */
interface LayerBadgeProps {
  layer: 1 | 2 | 3
  label?: string
}

const LAYER_META = {
  1: {
    name: "Layer 1",
    sub: "Game",
    color: "text-slate-300",
    bg: "bg-slate-500/15",
    border: "border-slate-400/30",
  },
  2: {
    name: "Layer 2",
    sub: "Personalized flow",
    color: "text-amber-200",
    bg: "bg-amber-500/15",
    border: "border-amber-400/40",
  },
  3: {
    name: "Layer 3",
    sub: "System learning",
    color: "text-emerald-200",
    bg: "bg-emerald-500/15",
    border: "border-emerald-400/40",
  },
} as const

export function LayerBadge({ layer, label }: LayerBadgeProps) {
  const meta = LAYER_META[layer]
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border backdrop-blur-sm ${meta.bg} ${meta.border}`}
    >
      <Layers className={`w-3.5 h-3.5 ${meta.color}`} />
      <span className={`text-[11px] font-semibold tracking-wide ${meta.color}`}>
        {meta.name}
      </span>
      <span className="text-[11px] text-white/50">·</span>
      <span className="text-[11px] text-white/70">{label ?? meta.sub}</span>
    </div>
  )
}
