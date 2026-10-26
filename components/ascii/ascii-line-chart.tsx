"use client"

import { motion, useInView, useReducedMotion } from "motion/react"
import { useLayoutEffect, useRef, useState, type ComponentProps, type KeyboardEvent, type PointerEvent } from "react"

import { cn } from "@/lib/utils"

const COLORS = ["text-primary", "text-amber-500", "text-sky-500", "text-destructive"]
const EASE_OUT = [0.23, 1, 0.32, 1] as const

/** Looks for area fills, five glyphs from empty to densest like the heatmap's. Fills use the second and third. */
export const fillGlyphs = {
  shade: "·░▒▓█",
  hash: ".:+#@",
  dollar: "·.¢$$",
  diamond: "·⋄◇◆◈",
  circle: "·∘○●◉",
}

/** A preset name, or any five glyphs from empty to densest. */
export type FillGlyphs = keyof typeof fillGlyphs | (string & {})

// Rows exactly 1em tall and clipped, so `_` meets the `|` and fill below it in any font.
const Rows = ({ rows }: { rows: string[] }) =>
  rows.map((r, i) => (
    <div key={i} className="h-[1em] overflow-hidden leading-none">
      {r}
    </div>
  ))

type FillCell = { char: string; clip?: string }

// Fill glyphs like ◆ or ★ often come from a fallback font at another width, so each sits centred in its own column.
const FillRows = ({ rows }: { rows: (FillCell | null)[][] }) =>
  rows.map((r, i) => (
    <div
      key={i}
      className="grid h-[1em] overflow-hidden leading-none"
      style={{ gridTemplateColumns: `repeat(${r.length}, minmax(0, 1fr))` }}
    >
      {r.map(
        (c, x) =>
          c && (
            <span key={x} className="text-center" style={{ gridColumn: x + 1, clipPath: c.clip }}>
              {c.char}
            </span>
          ),
      )}
    </div>
  ))

// The part of a line's cell under (or over) its `/`, `\` or `|`, so fills meet the stroke with no gap.
const clips = {
  below: { "/": "polygon(0 100%, 100% 0, 100% 100%)", "\\": "polygon(0 0, 100% 100%, 0 100%)", "|/": "inset(0 0 0 50%)", "|\\": "inset(0 50% 0 0)" },
  above: { "/": "polygon(0 0, 100% 0, 0 100%)", "\\": "polygon(0 0, 100% 0, 100% 100%)", "|/": "inset(0 50% 0 0)", "|\\": "inset(0 0 0 50%)" },
}
const otherSide = new Map(
  Object.keys(clips.below).flatMap((s) => {
    const [b, a] = [clips.below[s as keyof typeof clips.below], clips.above[s as keyof typeof clips.above]]
    return [[b, a], [a, b]] as const
  }),
)

/** Rounds to `digits` significant figures of the range, so axis ticks read 1370 rather than 1369.37. */
const nice = (v: number, span: number, digits: number) => {
  const exp = Math.floor(Math.log10(span || 1)) + 1 - digits
  return Number((Math.round(v / 10 ** exp) * 10 ** exp).toFixed(Math.max(0, -exp)))
}

/**
 * Text layers for each series on a `width × height` character grid: an ASCII `line` of `_` along a row, `/` or `\`
 * to step one row and `|` for bigger jumps, and with `fill` set, the area under it down to the series below (when
 * `stacked`) or the bottom, `near` glyphs in the top third and `far` below. `_` sits at the foot of its cell, so
 * fills start on the next row; a step's own cells get fill clipped to the side of the stroke it lies on. Within lines
 * and within fills each cell belongs to one series, earlier over later, except two clipped fills sharing a step's
 * cell, so overlapping series never draw on top of each other. Pass `plotted` already summed when stacking.
 */
export function plot(
  plotted: number[][],
  width: number,
  height: number,
  min: number,
  max: number,
  length: number,
  { fill, stacked = false }: { fill?: [far: string, near: string]; stacked?: boolean } = {},
) {
  const span = max - min || 1
  const cells: ({ layer: number; char: string } | null)[] = Array(width * height).fill(null)
  const fillCells: (FillCell | null)[][] = plotted.map(() => Array(width * height).fill(null))
  const rowAt = (data: number[], x: number) => {
    const p = length > 1 ? (x / (width - 1)) * (length - 1) : 0
    const i = Math.floor(p)
    if (i >= data.length || (p > i && i + 1 >= data.length)) return null
    const v = data[i] + ((data[i + 1] ?? data[i]) - data[i]) * (p - i)
    return Math.round((1 - Math.min(1, Math.max(0, (v - min) / span))) * (height - 1))
  }
  const rows = plotted.map((data) => Array.from({ length: width }, (_, x) => rowAt(data, x)))
  // The cells a step occupies in a column (`/`, `\` or a run of `|`), and which way it goes.
  const step = (row: (number | null)[], x: number) => {
    const r = row[x]
    const prev = row[x - 1] ?? r
    if (r === null || prev === null || prev === r) return null
    const glyph = r < prev ? ("/" as const) : ("\\" as const)
    return { from: Math.min(r, prev) + 1, to: Math.max(r, prev), shape: Math.abs(prev - r) === 1 ? glyph : (`|${glyph}` as const) }
  }
  // Later series draw first so earlier ones win shared cells; the first series is the one being read.
  const order = rows.map((row, k) => [row, k] as const).reverse()

  if (fill) {
    // A cell can hold two clipped fills, one each side of a stroke, but a whole one shuts out later series.
    // A later whole fill meeting an earlier clipped one takes the other side.
    const fills: { layer: number; cell: FillCell }[][] = Array.from({ length: width * height }, () => [])
    const put = (x: number, y: number, layer: number, cell: FillCell) => {
      const taken = fills[y * width + x]
      const clip = cell.clip ?? (taken.length === 1 ? otherSide.get(taken[0].cell.clip!) : undefined)
      if (taken.length && !clip) return
      if (!taken.some((t) => !t.cell.clip || t.cell.clip === clip)) taken.push({ layer, cell: { ...cell, clip } })
    }
    // Only block shades tile, so only they can be cut along a stroke; a half ◆ reads as a broken glyph.
    const tiles = /[▀-▟]/.test(fill[1])
    rows.forEach((row, k) =>
      row.forEach((r, x) => {
        if (r === null) return
        const own = tiles && step(row, x)
        if (own) for (let y = own.from; y <= own.to; y++) put(x, y, k, { char: fill[1], clip: clips.below[own.shape] })
        const top = Math.max(r, row[x - 1] ?? r) + 1
        const lower = stacked && k > 0 ? rows[k - 1] : null
        const below = lower && step(lower, x)
        // Down to the line below: whole cells over its `_` or step, then the part of the step's cells above the stroke.
        const bottom = lower?.[x] == null ? height - 1 : below ? below.from - (tiles ? 1 : 0) : lower[x]!
        for (let y = top; y <= bottom; y++)
          put(x, y, k, { char: y - top < (bottom + 1 - top) / 3 ? fill[1] : fill[0] })
        if (below && tiles)
          for (let y = Math.max(top, below.from); y <= below.to; y++)
            put(x, y, k, { char: y - top < (bottom + 1 - top) / 3 ? fill[1] : fill[0], clip: clips.above[below.shape] })
      }),
    )
    fills.forEach((taken, i) => taken.forEach((t) => (fillCells[t.layer][i] = t.cell)))
  }
  order.forEach(([row, k]) =>
    row.forEach((r, x) => {
      if (r === null) return
      const put = (y: number, char: string) => (cells[y * width + x] = { layer: k, char })
      const prev = row[x - 1] ?? r
      if (prev === r) return put(r, "_")
      if (Math.abs(prev - r) === 1) return put(Math.max(r, prev), r < prev ? "/" : "\\")
      for (let y = Math.min(r, prev) + 1; y <= Math.max(r, prev); y++) put(y, "|")
    }),
  )

  const line = (n: number) =>
    Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => (cells[y * width + x]?.layer === n ? cells[y * width + x]!.char : " ")).join(""),
    )
  const fillRows = (grid: (FillCell | null)[]) => Array.from({ length: height }, (_, y) => grid.slice(y * width, (y + 1) * width))
  return plotted.map((_, k) => ({ fill: fillRows(fillCells[k]), line: line(k) }))
}

export type LineSeries = {
  label: string
  data: number[]
  /** Colour for this series, e.g. `text-primary`. Cycles through a default palette when left out. */
  className?: string
}

export type AsciiLineChartProps = Omit<ComponentProps<"div">, "children"> & {
  series: LineSeries[]
  /** One per data point, shown along the x axis and in the readout. */
  labels?: string[]
  /** Plot width in characters. The plot narrows to fit a smaller container. */
  width?: number
  /** Plot height in characters. */
  height?: number
  min?: number
  max?: number
  /** Fill the area under each line with glyphs, denser just under the line. */
  area?: boolean
  /** How area fills look: a preset from `fillGlyphs`, or five glyphs from empty to densest. */
  glyphs?: FillGlyphs
  /** Pile each series on top of the ones before it. Readouts still show each series' own values. */
  stacked?: boolean
  format?: (value: number) => string
  /** Draw the lines in from the left the first time the chart scrolls into view. Off under reduced motion. */
  animate?: boolean
  /** Describes the chart for screen readers. */
  label: string
}

/** An ASCII line chart with axes and a cursor you scrub with the pointer or arrow keys. */
export function AsciiLineChart({
  series,
  labels,
  width = 60,
  height = 12,
  min,
  max,
  area = false,
  glyphs = "shade",
  stacked = false,
  format = String,
  animate = true,
  label,
  className,
  ...props
}: AsciiLineChartProps) {
  const [cursor, setCursor] = useState<number | null>(null)
  const [focus, setFocus] = useState<number | null>(null)
  const [fit, setFit] = useState(Number.POSITIVE_INFINITY)
  const root = useRef<HTMLDivElement>(null)
  const axis = useRef<HTMLDivElement>(null)
  const probe = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      const ch = probe.current!.getBoundingClientRect().width / 10
      setFit(Math.max(4, Math.floor((root.current!.clientWidth - axis.current!.offsetWidth) / ch)))
    })
    observer.observe(root.current!)
    observer.observe(probe.current!)
    return () => observer.disconnect()
  }, [])
  const cols = Math.min(width, fit)
  const inView = useInView(root, { once: true, amount: 0.4 })
  const reduce = useReducedMotion()
  const play = animate && !reduce

  const plotted = stacked
    ? series.map((s, k) => s.data.map((_, i) => series.slice(0, k + 1).reduce((n, t) => n + (t.data[i] ?? 0), 0)))
    : series.map((s) => s.data)
  const values = plotted.flat()
  const lo = min ?? (stacked ? 0 : Math.min(...values))
  const hi = max ?? Math.max(...values)
  const length = Math.max(...series.map((s) => s.data.length))
  const set = Array.from(fillGlyphs[glyphs as keyof typeof fillGlyphs] ?? glyphs)
  const plots = plot(plotted, cols, height, lo, hi, length, { fill: area ? [set[1], set[2]] : undefined, stacked })
  const dim = (i: number) => ({ opacity: focus === null || focus === i ? 1 : 0.2 })
  const fade = { duration: reduce ? 0 : 0.2 }
  const color = (i: number) => series[i].className ?? COLORS[i % COLORS.length]
  const xLabel = (i: number) => labels?.[i] ?? `#${i + 1}`
  // Positions are percentages of the plot, so they hold even if a fallback font draws a glyph wider than 1ch.
  const left = (i: number) => {
    const x = length > 1 ? Math.round((i / (length - 1)) * (cols - 1)) : 0
    return `${((x + 0.5) / cols) * 100}%`
  }

  const middle = Math.floor((height - 1) / 2)
  const tick = (row: number) => hi - (row / Math.max(1, height - 1)) * (hi - lo)
  const ticks = [0, middle, height - 1].filter((r, i, a) => a.indexOf(r) === i)
  // The middle tick sits somewhere inside its row, so it gets one digit less than the exact ends.
  const tickLabels = ticks.map((r) => format(nice(tick(r), hi - lo, r === 0 || r === height - 1 ? 3 : 2)))
  const pad = Math.max(...tickLabels.map((t) => t.length))
  const yAxis = Array.from({ length: height }, (_, r) => {
    const t = ticks.indexOf(r)
    return t < 0 ? `${" ".repeat(pad)} │` : `${tickLabels[t].padStart(pad)} ┤`
  })

  const xCount = labels?.length ? Math.min(length, Math.max(2, Math.floor(cols / 12))) : 0
  const xTicks = Array.from({ length: xCount }, (_, j) => Math.round((j * (length - 1)) / Math.max(1, xCount - 1)))

  const shown = cursor ?? length - 1
  const readout = (i: number) =>
    `${xLabel(i)}: ${series.map((s) => `${s.label} ${s.data[i] === undefined ? "no data" : format(s.data[i])}`).join(", ")}`

  const scrub = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * cols - 0.5
    setCursor(Math.min(length - 1, Math.max(0, Math.round((x / Math.max(1, cols - 1)) * (length - 1)))))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, (i: number) => number | null> = {
      ArrowLeft: (i) => Math.max(0, i - 1),
      ArrowRight: (i) => Math.min(length - 1, i + 1),
      Home: () => 0,
      End: () => length - 1,
      Escape: () => null,
    }
    const move = keys[e.key]
    if (!move || (e.key === "Escape" && cursor === null)) return
    e.preventDefault()
    setCursor(cursor === null && e.key.startsWith("Arrow") ? length - 1 : move(cursor ?? length - 1))
  }

  return (
    <div
      ref={root}
      role="group"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onBlur={() => setCursor(null)}
      // Inline-size containment lets the root take its container's width, which the plot then measures to fit.
      className={cn("group block w-full font-mono leading-[1.2] whitespace-pre tabular-nums outline-none contain-inline-size", className)}
      {...props}
    >
      <div className="flex w-fit max-w-full flex-col gap-[0.5lh] rounded-sm group-focus-visible:ring-2 group-focus-visible:ring-ring/50">
        <div aria-hidden className="flex w-0 min-w-full flex-wrap gap-x-[2ch]" style={{ paddingLeft: `${pad + 2}ch` }}>
          <span className="text-muted-foreground">{xLabel(shown)}</span>
          {series.map((s, i) => (
            <span key={s.label} onPointerEnter={() => setFocus(i)} onPointerLeave={() => setFocus(null)}>
              <span className={color(i)}>●</span> {s.label}{" "}
              <span className="text-foreground">{s.data[shown] === undefined ? "–" : format(s.data[shown])}</span>
            </span>
          ))}
        </div>
        <div aria-hidden className="grid grid-cols-[auto_auto]">
          <div ref={axis} className="text-muted-foreground">
            <Rows rows={yAxis} />
          </div>
          <div
            className="relative touch-pan-y"
            onPointerMove={scrub}
            onPointerDown={scrub}
            onPointerLeave={() => setCursor(null)}
          >
            <motion.div
              className="grid *:[grid-area:1/1]"
              initial={play ? { clipPath: "inset(0 100% 0 0)" } : false}
              animate={{ clipPath: !play || inView ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
              transition={{ duration: 1, ease: EASE_OUT }}
            >
              {area &&
                plots.map((p, i) => (
                  <motion.div key={`fill-${i}`} className={color(i)} initial={false} animate={dim(i)} transition={fade}>
                    <motion.div
                      initial={play ? { opacity: 0 } : false}
                      animate={{ opacity: !play || inView ? 0.6 : 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <FillRows rows={p.fill} />
                    </motion.div>
                  </motion.div>
                ))}
              {plots.map((p, i) => (
                <motion.div key={`line-${i}`} className={color(i)} initial={false} animate={dim(i)} transition={fade}>
                  <Rows rows={p.line} />
                </motion.div>
              ))}
            </motion.div>
            <span ref={probe} className="invisible absolute">
              ──────────
            </span>
            {cursor !== null && (
              <motion.div
                className="pointer-events-none absolute inset-y-0 -translate-x-1/2 text-foreground/60"
                initial={{ left: left(cursor) }}
                animate={{ left: left(cursor) }}
                transition={{ duration: reduce ? 0 : 0.12, ease: EASE_OUT }}
              >
                <Rows rows={Array(height).fill("┊")} />
              </motion.div>
            )}
          </div>
          <div className="text-muted-foreground">
            <Rows rows={[`${" ".repeat(pad + 1)}└`]} />
          </div>
          <div className="w-0 min-w-full text-muted-foreground">
            <Rows rows={["─".repeat(cols)]} />
          </div>
          <div />
          <div className="relative h-[1lh] text-muted-foreground">
            {xTicks.map((i, j) => (
              <span
                key={i}
                className={cn("absolute", j === 0 ? "" : j === xTicks.length - 1 ? "-translate-x-full" : "-translate-x-1/2")}
                style={{ left: j === 0 ? 0 : j === xTicks.length - 1 ? "100%" : left(i) }}
              >
                {labels![i]}
              </span>
            ))}
          </div>
        </div>
        <table className="sr-only" aria-label={label}>
          <thead>
            <tr>
              <th scope="col">Point</th>
              {series.map((s) => (
                <th key={s.label} scope="col">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length }, (_, i) => (
              <tr key={i}>
                <th scope="row">{xLabel(i)}</th>
                {series.map((s) => (
                  <td key={s.label}>{s.data[i] === undefined ? "" : format(s.data[i])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div aria-live="polite" className="sr-only">
          {cursor !== null && readout(cursor)}
        </div>
      </div>
    </div>
  )
}
