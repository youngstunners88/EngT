"use client"

import { useEffect, useRef, useCallback } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: "confetti" | "sparkle" | "star" | "firework"
  rotation: number
  rotationSpeed: number
}

interface ParticleEffectsProps {
  trigger: "word-complete" | "streak" | "level-up" | "game-over" | null
  onComplete?: () => void
}

const COLORS = {
  gold: ["#FFD700", "#FFA500", "#FFEC8B", "#F4A460"],
  rainbow: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"],
  celebration: ["#FF1493", "#00CED1", "#FFD700", "#7FFF00", "#FF4500", "#9400D3"],
  firework: ["#FFFFFF", "#FFD700", "#FF6347", "#00FFFF", "#FF69B4", "#7CFC00"],
}

export function ParticleEffects({ trigger, onComplete }: ParticleEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)

  const createConfetti = useCallback((count: number, centerX: number, centerY: number) => {
    const particles: Particle[] = []
    const colors = COLORS.celebration
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 8 + Math.random() * 12
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        life: 1,
        maxLife: 1,
        size: 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: "confetti",
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
      })
    }
    return particles
  }, [])

  const createSparkles = useCallback((count: number, centerX: number, centerY: number) => {
    const particles: Particle[] = []
    const colors = COLORS.gold
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 6
      particles.push({
        x: centerX + (Math.random() - 0.5) * 200,
        y: centerY + (Math.random() - 0.5) * 200,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: "sparkle",
        rotation: 0,
        rotationSpeed: 0,
      })
    }
    return particles
  }, [])

  const createStars = useCallback((count: number, centerX: number, centerY: number) => {
    const particles: Particle[] = []
    const colors = COLORS.rainbow
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count
      const speed = 4 + Math.random() * 8
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        size: 10 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: "star",
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      })
    }
    return particles
  }, [])

  const createFireworks = useCallback((canvas: HTMLCanvasElement) => {
    const particles: Particle[] = []
    const colors = COLORS.firework
    const burstCount = 3
    
    for (let b = 0; b < burstCount; b++) {
      const burstX = canvas.width * (0.2 + Math.random() * 0.6)
      const burstY = canvas.height * (0.2 + Math.random() * 0.4)
      const particleCount = 30 + Math.floor(Math.random() * 20)
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3
        const speed = 5 + Math.random() * 10
        particles.push({
          x: burstX,
          y: burstY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 1,
          size: 4 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: "firework",
          rotation: 0,
          rotationSpeed: 0,
        })
      }
    }
    return particles
  }, [])

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, p: Particle) => {
    ctx.save()
    ctx.globalAlpha = p.life
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)

    switch (p.type) {
      case "confetti":
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        break

      case "sparkle":
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
        gradient.addColorStop(0, p.color)
        gradient.addColorStop(0.5, p.color + "80")
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(0, 0, p.size, 0, Math.PI * 2)
        ctx.fill()
        break

      case "star":
        ctx.fillStyle = p.color
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
          const innerAngle = angle + Math.PI / 5
          const outerRadius = p.size / 2
          const innerRadius = p.size / 4
          if (i === 0) {
            ctx.moveTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius)
          } else {
            ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius)
          }
          ctx.lineTo(Math.cos(innerAngle) * innerRadius, Math.sin(innerAngle) * innerRadius)
        }
        ctx.closePath()
        ctx.fill()
        break

      case "firework":
        const fwGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
        fwGradient.addColorStop(0, "#FFFFFF")
        fwGradient.addColorStop(0.3, p.color)
        fwGradient.addColorStop(1, "transparent")
        ctx.fillStyle = fwGradient
        ctx.beginPath()
        ctx.arc(0, 0, p.size, 0, Math.PI * 2)
        ctx.fill()
        break
    }

    ctx.restore()
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particlesRef.current = particlesRef.current.filter((p) => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.2 // gravity
      p.vx *= 0.99 // friction
      p.rotation += p.rotationSpeed
      p.life -= 0.015

      if (p.life > 0) {
        drawParticle(ctx, p)
        return true
      }
      return false
    })

    if (particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      isRunningRef.current = false
      onComplete?.()
    }
  }, [drawParticle, onComplete])

  useEffect(() => {
    if (!trigger) return

    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    let newParticles: Particle[] = []

    switch (trigger) {
      case "word-complete":
        newParticles = [
          ...createConfetti(40, centerX, centerY),
          ...createSparkles(20, centerX, centerY),
        ]
        break
      case "streak":
        newParticles = [
          ...createStars(30, centerX, centerY),
          ...createConfetti(50, centerX, centerY),
          ...createSparkles(30, centerX, centerY),
        ]
        break
      case "level-up":
        newParticles = createFireworks(canvas)
        break
      case "game-over":
        newParticles = createSparkles(50, centerX, centerY)
        break
    }

    particlesRef.current = [...particlesRef.current, ...newParticles]

    if (!isRunningRef.current) {
      isRunningRef.current = true
      animate()
    }
  }, [trigger, createConfetti, createSparkles, createStars, createFireworks, animate])

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: "100vw", height: "100vh" }}
    />
  )
}
