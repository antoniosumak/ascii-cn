"use client"

import { animate as tween, motion, useInView, useReducedMotion } from "motion/react"
import { useEffect, useRef, useState, type ComponentProps, type KeyboardEvent, type PointerEvent } from "react"

import { cn } from "@/lib/utils"

// Bit for each dot of a braille cell, indexed [row][column] on its 2×4 grid.
const DOTS = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
]

const COLORS = ["text-primary", "text-amber-500", "text-sky-500", "text-destructive", "text-violet-500", "text-muted-foreground"]
const EASE_OUT = [0.23, 1, 0.32, 1] as const
const TAU = Math.PI * 2

const toRows = (cells: Uint8Array, width: number) =>
  Array.from({ length: cells.length / width }, (_, r) =>
    Array.from(cells.subarray(r * width, (r + 1) * width), (b) => String.fromCharCode(0x2800 + b)).join(""),
  )

// Fixed-height rows keep braille rows touching; a fallback font would otherwise stretch each line box.
const Rows = ({ rows }: { rows: string[] }) =>
  rows.map((r, i) => (
    <div key={i} className="h-[1.2em]">
      {r}
    </div>
  ))

/** Index of the slice at `turn` (0 to 1, clockwise from twelve o'clock), given each slice's cumulative end. */
export const sliceAt = (ends: number[], turn: number) => {
  const i = ends.findIndex((e) => turn < e)
  return i < 0 ? ends.length - 1 : i
}

/**
 * A disc in braille, `width` characters across, as one text layer per value, clockwise from twelve o'clock.
 * `inner` (0 to 1) hollows it into a donut and `sweep` (0 to 1) draws only that much of the turn.
 * Dots are assumed square, which holds for a 0.6em-wide font at line-height 1.2.
 */
export function pie(values: number[], width: number, { inner = 0, sweep = 1 }: { inner?: number; sweep?: number } = {}) {
  const w = width * 2
  const height = Math.ceil(w / 4)
  const h = height * 4
  const outer = w / 2
  const total = values.reduce((n, v) => n + Math.max(0, v), 0) || 1
  let sum = 0
  const ends = values.map((v) => (sum += Math.max(0, v)) / total)
  const layers = values.map(() => new Uint8Array(width * height))

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x + 0.5 - w / 2
      const dy = y + 0.5 - h / 2
      const d = Math.hypot(dx, dy)
      if (d > outer || d < outer * inner) continue
      const turn = (Math.atan2(dx, -dy) / TAU + 1) % 1
      if (turn > sweep) continue
      layers[sliceAt(ends, turn)][(y >> 2) * width + (x >> 1)] |= DOTS[y & 3][x & 1]
    }
  }
  return { slices: layers.map((l) => toRows(l, width)), ends }
}

export type PieDatum = {
  label: string
  value: number
  /** Colour for this slice, e.g. `text-primary`. Cycles through a default palette when left out. */
  className?: string
}

export type AsciiPieChartProps = Omit<ComponentProps<"div">, "children"> & {
  data: PieDatum[]
  /** Diameter in characters. The height is half that, since braille dots come out square. */
  width?: number
  /** Hole size from 0 (a pie) to 1. Anything above 0 shows the total, or the active slice, in the middle. */
  innerRadius?: number
  format?: (value: number) => string
  legend?: boolean
  /** Sweep the slices in clockwise the first time the chart scrolls into view. Off under reduced motion. */
  animate?: boolean
  /** Describes the chart for screen readers. */
  label: string
}

/** A pie or donut in braille. Hover, tap or arrow keys pop a slice out and read its share. */
export function AsciiPieChart({
  data,
  width = 24,
  innerRadius = 0,
  format = String,
  legend = true,
  animate = true,
  label,
  className,
  ...props
}: AsciiPieChartProps) {
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, { once: true, amount: 0.4 })
  const reduce = useReducedMotion()
  const play = animate && !reduce
  const [sweep, setSweep] = useState(0)
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    if (!play || !inView) return
    const controls = tween(0, 1, { duration: 0.9, ease: EASE_OUT, onUpdate: setSweep })
    return () => controls.stop()
  }, [play, inView])

  const total = data.reduce((n, d) => n + Math.max(0, d.value), 0)
  const p = pie(
    data.map((d) => d.value),
    width,
    { inner: innerRadius, sweep: play ? sweep : 1 },
  )
  const color = (i: number) => data[i].className ?? COLORS[i % COLORS.length]
  const share = (v: number) => `${Math.round((Math.max(0, v) / (total || 1)) * 100)}%`
  const readout = (i: number) => `${data[i].label}: ${format(data[i].value)}, ${share(data[i].value)}`
  const spring = reduce ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT }

  const hit = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const dx = (e.clientX - rect.left) / rect.width - 0.5
    const dy = (e.clientY - rect.top) / rect.height - 0.5
    const d = Math.hypot(dx, dy) * 2
    setActive(d > 1 || d < innerRadius ? null : sliceAt(p.ends, (Math.atan2(dx, -dy) / TAU + 1) % 1))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = data.length
    const keys: Record<string, (i: number) => number | null> = {
      ArrowRight: (i) => (i + 1) % n,
      ArrowDown: (i) => (i + 1) % n,
      ArrowLeft: (i) => (i - 1 + n) % n,
      ArrowUp: (i) => (i - 1 + n) % n,
      Home: () => 0,
      End: () => n - 1,
      Escape: () => null,
    }
    const move = keys[e.key]
    if (!move || (e.key === "Escape" && active === null)) return
    e.preventDefault()
    // With nothing active, the first step lands on the first slice going forward and the last going back.
    setActive(move(active ?? (e.key === "ArrowLeft" || e.key === "ArrowUp" ? 0 : -1)))
  }

  return (
    <div
      ref={root}
      role="group"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onBlur={() => setActive(null)}
      className={cn(
        "group inline-flex flex-wrap items-center gap-x-[3ch] gap-y-[1lh] rounded-sm font-mono leading-[1.2] whitespace-pre tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="relative grid touch-pan-y *:[grid-area:1/1]"
        onPointerMove={hit}
        onPointerDown={hit}
        onPointerLeave={() => setActive(null)}
      >
        {p.slices.map((rows, i) => {
          const middle = (((p.ends[i - 1] ?? 0) + p.ends[i]) / 2) * TAU
          const out = active === i ? 0.4 : 0
          return (
            <motion.div
              key={i}
              className={color(i)}
              initial={false}
              animate={{
                opacity: active === null || active === i ? 1 : 0.3,
                x: `${Math.sin(middle) * out}em`,
                y: `${-Math.cos(middle) * out}em`,
              }}
              transition={spring}
            >
              <Rows rows={rows} />
            </motion.div>
          )
        })}
        {innerRadius > 0 && (
          <div className="pointer-events-none flex flex-col items-center justify-center">
            <span className="font-semibold text-foreground">{format(active === null ? total : data[active].value)}</span>
            <span className="text-[0.85em] text-muted-foreground">{active === null ? "total" : data[active].label}</span>
          </div>
        )}
      </div>
      {legend && (
        <ul aria-hidden className="flex flex-col gap-[0.25lh]">
          {data.map((d, i) => (
            <motion.li
              key={d.label}
              className="flex gap-[1ch]"
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              initial={false}
              animate={{ opacity: active === null || active === i ? 1 : 0.4 }}
              transition={spring}
            >
              <span className={color(i)}>●</span>
              <span className="text-muted-foreground">{d.label}</span>
              <span className="ml-auto pl-[1ch] text-foreground">{format(d.value)}</span>
              <span className="w-[4ch] text-right text-muted-foreground">{share(d.value)}</span>
            </motion.li>
          ))}
        </ul>
      )}
      <table className="sr-only" aria-label={label}>
        <thead>
          <tr>
            <th scope="col">Slice</th>
            <th scope="col">Value</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{format(d.value)}</td>
              <td>{share(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div aria-live="polite" className="sr-only">
        {active !== null && readout(active)}
      </div>
    </div>
  )
}
