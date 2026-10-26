"use client"

import { animate as tween, motion, useInView, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState, type ComponentProps } from "react"

import { cn } from "@/lib/utils"

const VERTICAL = " ▁▂▃▄▅▆▇█"
const HORIZONTAL = " ▏▎▍▌▋▊▉█"
const EASE_OUT = [0.23, 1, 0.32, 1] as const

const range = (data: number[], min?: number, max?: number) => {
  const lo = min ?? Math.min(...data)
  const hi = max ?? Math.max(...data)
  return [lo, hi - lo || 1] as const
}

/** One character per value, eight steps tall. */
export function sparkline(data: number[], min?: number, max?: number) {
  const [lo, span] = range(data, min, max)
  return data.map((v) => VERTICAL[1 + Math.round(((v - lo) / span) * 7)]).join("")
}

/** Rows of a vertical bar chart, top first, `height` characters tall with eighth-block precision. */
export function columns(data: number[], height: number, max?: number) {
  const [, span] = range(data, 0, max)
  const levels = data.map((v) => (Math.max(0, v) / span) * height * 8)
  return Array.from({ length: height }, (_, row) => {
    const base = (height - 1 - row) * 8
    return levels.map((l) => VERTICAL[Math.round(Math.min(8, Math.max(0, l - base)))]).join("")
  })
}

export type AsciiSparklineProps = Omit<ComponentProps<"span">, "children"> & {
  data: number[]
  min?: number
  max?: number
  /** Rise in from the left the first time the sparkline scrolls into view. Off under reduced motion. */
  animate?: boolean
  label: string
}

export function AsciiSparkline({ data, min, max, animate = true, label, className, ...props }: AsciiSparklineProps) {
  const root = useRef<HTMLSpanElement>(null)
  const inView = useInView(root, { once: true, amount: 0.5 })
  const reduce = useReducedMotion()
  const play = animate && !reduce
  const step = Math.min(0.04, 0.6 / data.length)

  return (
    <span ref={root} role="img" aria-label={label} className={cn("font-mono whitespace-pre", className)} {...props}>
      {Array.from(sparkline(data, min, max), (glyph, i) => (
        <motion.span
          // Keyed by glyph too, so a value that changes rises in again.
          key={`${i}${glyph}`}
          aria-hidden
          className="inline-block"
          initial={play ? { opacity: 0, y: "40%" } : false}
          animate={!play || inView ? { opacity: 1, y: "0%" } : { opacity: 0, y: "40%" }}
          transition={{ duration: 0.3, ease: EASE_OUT, delay: i * step }}
        >
          {glyph}
        </motion.span>
      ))}
    </span>
  )
}

export type AsciiBarChartProps = Omit<ComponentProps<"div">, "children"> & {
  data: { label: string; value: number }[]
  /** Bar width in characters for the largest value. */
  width?: number
  max?: number
  format?: (value: number) => string
  /** Grow the bars from the left, one row after another, the first time the chart scrolls into view. Off under reduced motion. */
  animate?: boolean
}

const STAGGER = 0.08
const GROW = 0.7

/** Horizontal bars with labels, the kind you'd find in a terminal dashboard. */
export function AsciiBarChart({
  data,
  width = 32,
  max,
  format = String,
  animate = true,
  className,
  ...props
}: AsciiBarChartProps) {
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, { once: true, amount: 0.4 })
  const reduce = useReducedMotion()
  const play = animate && !reduce
  // Seconds since the bars started growing; each row eases in on its own slot of this clock.
  const [time, setTime] = useState(0)
  const total = GROW + STAGGER * (data.length - 1)

  useEffect(() => {
    if (!play || !inView) return
    const controls = tween(0, total, { duration: total, ease: "linear", onUpdate: setTime })
    return () => controls.stop()
  }, [play, inView, total])

  const grown = (i: number) => {
    if (!play) return 1
    const t = Math.min(1, Math.max(0, (time - i * STAGGER) / GROW))
    return 1 - (1 - t) ** 3
  }

  const [, span] = range(
    data.map((d) => d.value),
    0,
    max,
  )
  const labelWidth = Math.max(...data.map((d) => d.label.length))
  return (
    <div ref={root} role="table" className={cn("font-mono whitespace-pre tabular-nums", className)} {...props}>
      {data.map((d, i) => {
        const v = (Math.max(0, d.value) / span) * grown(i) * width
        const full = Math.floor(v)
        const bar = "█".repeat(full) + (full < width ? HORIZONTAL[Math.round((v - full) * 8)] : "")
        return (
          <div role="row" key={d.label} className="flex gap-[1ch]">
            <span role="rowheader" className="text-muted-foreground">
              {d.label.padEnd(labelWidth)}
            </span>
            <span role="cell" aria-hidden className="inline-block" style={{ width: `${width + 1}ch` }}>
              {bar}
            </span>
            <motion.span
              role="cell"
              initial={play ? { opacity: 0 } : false}
              animate={{ opacity: !play || inView ? 1 : 0 }}
              transition={{ duration: 0.3, delay: GROW * 0.5 + i * STAGGER }}
            >
              {format(d.value)}
            </motion.span>
          </div>
        )
      })}
    </div>
  )
}
