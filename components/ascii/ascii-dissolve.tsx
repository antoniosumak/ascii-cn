"use client"

import { useEffect, useEffectEvent, useRef, useState, type ComponentProps } from "react"

import { cn } from "@/lib/utils"

export type AsciiDissolveProps = Omit<ComponentProps<"span">, "children"> & {
  text: string
  /**
   * "view" resolves when scrolled into view, "mount" resolves on mount,
   * "hover" dissolves and resolves on every pointer enter. Ignored when `dissolved` is set.
   */
  trigger?: "view" | "mount" | "hover"
  /** Controls the state yourself: true dissolves, false resolves. */
  dissolved?: boolean
  /** Milliseconds for one full dissolve or resolve. */
  duration?: number
  /** Noise a character crumbles into before it thins out through ▓▒░. */
  glyphs?: string
}

const SHADES = "▓▒░"
// Where each character comes to rest once dissolved; the gaps make it read as grain rather than a solid bar.
const DUST = "░░▒░ ░▒░"
/** Share of the timeline each character spends changing, so neighbours overlap. */
const SPREAD = 0.4

const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
const dust = (i: number) => DUST[(Math.imul(i + 1, 2654435761) >>> 24) % DUST.length]

export function AsciiDissolve({
  text,
  trigger = "view",
  dissolved,
  duration = 900,
  glyphs = "#%&@*+=:;",
  onPointerEnter,
  className,
  ...props
}: AsciiDissolveProps) {
  const chars = Array.from(text)
  const startsDissolved = dissolved ?? trigger !== "hover"
  const [cells, setCells] = useState<string[] | null>(() => (startsDissolved ? chars.map((c, i) => (/\s/.test(c) ? c : dust(i))) : null))
  const amount = useRef(startsDissolved ? 1 : 0)
  const order = useRef<number[]>([])
  const raf = useRef(0)
  const root = useRef<HTMLSpanElement>(null)

  const render = (p: number) => {
    if (p <= 0) return setCells(null)
    setCells(
      chars.map((c, i) => {
        if (/\s/.test(c)) return c
        const d = Math.min(1, Math.max(0, (p - order.current[i] * (1 - SPREAD)) / SPREAD))
        if (d === 0) return c
        if (d === 1) return dust(i)
        const level = Math.floor(d * (SHADES.length + 1))
        return level === 0 ? glyphs[Math.floor(Math.random() * glyphs.length)] : SHADES[level - 1]
      }),
    )
  }

  /** Animates to `to`, or out to fully dissolved and back again when `pulse` is set. */
  const run = (to: number, pulse = false) => {
    cancelAnimationFrame(raf.current)
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      amount.current = 0
      raf.current = requestAnimationFrame(() => setCells(null))
      return
    }
    const from = amount.current
    // Keep the order mid-flight so a reversal retraces the same grains.
    if (from === 0 || from === 1 || order.current.length !== chars.length) order.current = chars.map(() => Math.random())
    const span = (pulse ? 2 - from : Math.abs(to - from)) * duration
    const start = performance.now()
    let last = 0
    const step = (now: number) => {
      const t = span > 0 ? Math.min(1, (now - start) / span) : 1
      let p: number
      if (!pulse) p = from + (to - from) * easeInOut(t)
      else {
        const peak = (1 - from) / (2 - from)
        p = t < peak ? from + (1 - from) * easeInOut(t / peak) : 1 - easeInOut((t - peak) / (1 - peak))
      }
      amount.current = p
      // Repainting at ~30 fps keeps the noise grainy instead of a blur.
      if (t === 1 || now - last > 32) {
        last = now
        render(p)
      }
      if (t < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }

  const onMount = useEffectEvent(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return run(0)
    if (dissolved !== undefined) return run(dissolved ? 1 : 0)
    if (trigger === "mount") return run(0)
    if (trigger !== "view" || !root.current) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        run(0)
      },
      { threshold: 0.6 },
    )
    io.observe(root.current)
    return () => io.disconnect()
  })

  useEffect(() => {
    const cleanup = onMount()
    return () => {
      cleanup?.()
      cancelAnimationFrame(raf.current)
    }
  }, [text, dissolved, trigger])

  return (
    <span
      ref={root}
      onPointerEnter={(e) => {
        if (dissolved === undefined && trigger === "hover") run(0, true)
        onPointerEnter?.(e)
      }}
      className={cn("whitespace-pre-wrap", className)}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {chars.map((c, i) => {
          const cell = cells?.[i]
          const noisy = cell !== undefined && cell !== c
          // Every character keeps the same wrapper so shaping, and therefore width, is identical in both states.
          return (
            <span key={i} className="relative">
              <span className={noisy ? "invisible" : undefined}>{c}</span>
              {noisy && <span className="absolute inset-0 flex items-center justify-center [clip-path:inset(0)]">{cell}</span>}
            </span>
          )
        })}
      </span>
    </span>
  )
}
