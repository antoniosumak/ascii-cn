"use client"

import { motion, useInView, useReducedMotion } from "motion/react"
import { useLayoutEffect, useRef, useState, type ComponentProps, type KeyboardEvent } from "react"

import { cn } from "@/lib/utils"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY = 86_400_000

/** Looks for the cells, five glyphs each: empty, then low to high, the last for the densest or highlighted cell. */
export const heatmapGlyphs = {
  shade: "·░▒▓█",
  hash: ".:+#@",
  dollar: "·.¢$$",
  diamond: "·⋄◇◆◈",
  circle: "·∘○●◉",
}

/** A preset name, or any five glyphs from empty to densest. */
export type HeatmapGlyphs = keyof typeof heatmapGlyphs | (string & {})

/** Block elements (▀ to ▟) fill their cell and are clipped to it; other glyphs are drawn smaller so their full height shows. */
const isBlock = (glyph: string) => glyph >= "\u2580" && glyph <= "\u259f"

// Dates are handled as UTC midnights so the grid never shifts with the viewer's time zone.
const parse = (d: string | Date) => (typeof d === "string" ? Date.parse(d.slice(0, 10)) : Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
const iso = (t: number) => new Date(t).toISOString().slice(0, 10)

export const formatDay = (date: string) => {
  const d = new Date(Date.parse(date))
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

/** Shade level from 0 (nothing) to 4, in even steps up to `max`. */
export function heatLevel(value: number, max: number) {
  return value <= 0 ? 0 : Math.min(4, Math.max(1, Math.ceil((value / (max || 1)) * 4)))
}

export type HeatmapDatum = { date: string; value: number }

/** Week columns, Sunday first, ending on the week of `end`. Days after `end` are null. */
export function calendar(data: HeatmapDatum[], weeks: number, end?: string | Date) {
  const values = new Map(data.map((d) => [d.date.slice(0, 10), d.value]))
  const last = end ? parse(end) : Math.max(...data.map((d) => parse(d.date)))
  const first = last - (new Date(last).getUTCDay() + (weeks - 1) * 7) * DAY
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const t = first + (w * 7 + d) * DAY
      return t > last ? null : { date: iso(t), value: values.get(iso(t)) ?? 0 }
    }),
  )
}

export type AsciiHeatmapProps = Omit<ComponentProps<"div">, "children"> & {
  /** One entry per day as `YYYY-MM-DD`. Missing days count as 0. */
  data: HeatmapDatum[]
  /** Columns to show. The oldest are dropped when the container is too narrow. */
  weeks?: number
  /** Last day shown. Defaults to the latest date in `data`. */
  end?: string | Date
  /** Value that gets the darkest shade. Defaults to the largest value. */
  max?: number
  /** Readout for the hovered or focused day. */
  format?: (value: number, date: string) => string
  /** Describes the chart for screen readers. */
  label: string
  legend?: boolean
  /** How the days look: a preset from `heatmapGlyphs`, or five glyphs from nothing to the busiest day. */
  glyphs?: HeatmapGlyphs
  /** Ripple the days in from the top left the first time the grid scrolls into view. Off under reduced motion. */
  animate?: boolean
}

/** A contribution-style calendar, one shade glyph per day. Colour it with `text-*`. */
export function AsciiHeatmap({
  data,
  weeks = 53,
  end,
  max,
  format = (value, date) => `${value} on ${formatDay(date)}`,
  label,
  legend = true,
  glyphs = "shade",
  animate = true,
  className,
  ...props
}: AsciiHeatmapProps) {
  const [active, setActive] = useState<[number, number] | null>(null)
  const [fit, setFit] = useState(Number.POSITIVE_INFINITY)
  const root = useRef<HTMLDivElement>(null)
  const probe = useRef<HTMLSpanElement>(null)
  const dayLabel = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      const ch = probe.current!.offsetWidth / 10
      setFit(Math.max(1, Math.floor((root.current!.clientWidth - dayLabel.current!.offsetWidth) / (ch * 1.3))))
    })
    observer.observe(root.current!)
    observer.observe(probe.current!)
    return () => observer.disconnect()
  }, [])
  const inView = useInView(root, { once: true, amount: 0.3 })
  const reduce = useReducedMotion()
  const play = animate && !reduce
  const columns = Math.min(weeks, fit)
  const shades = Array.from(heatmapGlyphs[glyphs as keyof typeof heatmapGlyphs] ?? glyphs)
  const blocky = isBlock(shades[4])
  const grid = calendar(data, columns, end)
  const top = max ?? Math.max(1, ...grid.flat().map((c) => c?.value ?? 0))
  const cell = active ? grid[active[0]]?.[active[1]] : null

  const months: { week: number; name: string }[] = []
  grid.forEach((week, w) => {
    const m = new Date(Date.parse(week[0]!.date)).getUTCMonth()
    const prev = w > 0 ? new Date(Date.parse(grid[w - 1][0]!.date)).getUTCMonth() : -1
    if (m === prev) return
    // A month that starts in the last two columns before the next one has no room for its name.
    if (months.length && w - months.at(-1)!.week < 3) months.pop()
    months.push({ week: w, name: MONTHS[m] })
  })
  if (months.length > 1 && months[1].week - months[0].week < 3) months.shift()

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
    if (e.key === "Escape" && active) {
      e.preventDefault()
      return setActive(null)
    }
    const move = moves[e.key]
    if (!move) return
    e.preventDefault()
    if (!active) return setActive([columns - 1, grid[columns - 1].findLastIndex(Boolean)])
    const w = Math.min(columns - 1, Math.max(0, active[0] + move[0]))
    const d = Math.min(6, Math.max(0, active[1] + move[1]))
    if (grid[w][d]) setActive([w, d])
  }

  return (
    <div
      ref={root}
      role="group"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onBlur={() => setActive(null)}
      // Inline-size containment lets the root take its container's width, which decides how many weeks fit.
      className={cn("group relative block w-full font-mono leading-none whitespace-pre outline-none contain-inline-size", className)}
      {...props}
    >
      <span ref={probe} aria-hidden className="invisible absolute w-[10ch]" />
      <div className="flex w-fit max-w-full flex-col gap-[0.75lh] rounded-sm group-focus-visible:ring-2 group-focus-visible:ring-ring/50">
        <div
          aria-hidden
          className="grid gap-[0.3ch]"
          style={{ gridTemplateColumns: `auto repeat(${columns}, 1ch)`, gridTemplateRows: "auto repeat(7, 1ch)" }}
          onPointerLeave={() => setActive(null)}
        >
          {months.map((m) => (
            <span key={m.week} className="pb-[0.4em] text-[0.85em] text-muted-foreground" style={{ gridColumn: m.week + 2, gridRow: 1 }}>
              {m.name}
            </span>
          ))}
          {[1, 3, 5].map((d) => (
            <span
              key={d}
              ref={d === 1 ? dayLabel : undefined}
              className="self-center pr-[0.75ch] text-[0.85em] text-muted-foreground"
              style={{ gridColumn: 1, gridRow: d + 2 }}
            >
              {WEEKDAYS[d]}
            </span>
          ))}
          {grid.map((week, w) =>
            week.map(
              (c, d) =>
                c && (
                  <motion.span
                    key={c.date}
                    initial={play ? { opacity: 0, scale: 0.4 } : false}
                    animate={!play || inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: ((w + d * 0.8) / (columns + 4.8)) * 0.8 }}
                    onPointerEnter={() => setActive([w, d])}
                    className={cn(
                      // A 1ch square keeps the cells square and evenly spaced in any font.
                      "block size-[1ch] text-center leading-[1ch]",
                      blocky && "overflow-hidden",
                      heatLevel(c.value, top) === 0 && "text-muted-foreground/50",
                      active?.[0] === w && active[1] === d && "outline outline-offset-1 outline-foreground",
                    )}
                    style={{ gridColumn: w + 2, gridRow: d + 2 }}
                  >
                    {blocky ? shades[heatLevel(c.value, top)] : <span className="text-[0.85em]">{shades[heatLevel(c.value, top)]}</span>}
                  </motion.span>
                ),
            ),
          )}
        </div>
        <div className="flex w-0 min-w-full flex-wrap items-center justify-between gap-x-[2ch] gap-y-[0.5lh] text-[0.85em]">
          <span aria-live="polite" className="whitespace-normal text-muted-foreground">
            {cell ? format(cell.value, cell.date) : " "}
          </span>
          {legend && (
            <span aria-hidden className="ml-auto">
              <span className="text-muted-foreground">less</span>{" "}
              <span className="text-[1.15em] tracking-[0.3ch]">
                <span className="text-muted-foreground/50">{shades[0]}</span>
                {shades.slice(1).join("")}
              </span>{" "}
              <span className="text-muted-foreground">more</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
