"use client"

import { motion, useInView, useReducedMotion } from "motion/react"
import { Fragment, useRef, useState, type ComponentProps, type KeyboardEvent } from "react"

import { cn } from "@/lib/utils"

const COLORS = ["text-primary", "text-amber-500", "text-sky-500", "text-destructive"]
const EASE_OUT = [0.23, 1, 0.32, 1] as const

/** Looks for the cells, five glyphs each: empty, then low to high, the last for the densest or highlighted cell. */
export const columnGlyphs = {
  shade: "·░▒▓█",
  hash: ".:+#@",
  dollar: "·.¢$$",
  diamond: "·⋄◇◆◈",
  circle: "·∘○●◉",
}

/** A preset name, or any five glyphs from empty to densest. */
export type ColumnGlyphs = keyof typeof columnGlyphs | (string & {})

/** Block elements (▀ to ▟) fill their cell and are clipped to it; other glyphs are drawn smaller so their full height shows. */
const isBlock = (glyph: string) => glyph >= "\u2580" && glyph <= "\u259f"

/** Rounds to `digits` significant figures of the range, so axis ticks read 1370 rather than 1369.37. */
const nice = (v: number, span: number, digits: number) => {
  const exp = Math.floor(Math.log10(span || 1)) + 1 - digits
  return Number((Math.round(v / 10 ** exp) * 10 ** exp).toFixed(Math.max(0, -exp)))
}

/** Glyph level of each cell of one bar, bottom first, `height` cells tall: 3 for whole cells, 1 or 2 for a part-filled top, 0 above it. */
export function bar(value: number, max: number, height: number) {
  const level = (Math.max(0, value) / (max || 1)) * height
  return Array.from({ length: height }, (_, row) => {
    const fill = Math.min(1, level - row)
    return fill >= 0.85 ? 3 : fill >= 0.5 ? 2 : fill >= 0.15 ? 1 : 0
  })
}

export type ColumnSeries = {
  label: string
  data: number[]
  /** Colour for this series, e.g. `text-primary`. Cycles through a default palette when left out. */
  className?: string
}

export type AsciiColumnChartProps = Omit<ComponentProps<"div">, "children"> & {
  series: ColumnSeries[]
  /** One per group of bars, shown under it and in the readout. */
  labels: string[]
  /** Plot height in cells. */
  height?: number
  max?: number
  /** How the cells look: a preset from `columnGlyphs`, or five glyphs from empty to the highlighted cell. */
  glyphs?: ColumnGlyphs
  format?: (value: number) => string
  /** Bars stack up block by block the first time the chart scrolls into view. Off under reduced motion. */
  animate?: boolean
  /** Describes the chart for screen readers. */
  label: string
}

/** Vertical bars built from square shade blocks, grouped by label, with a readout you scrub with the pointer or arrow keys. */
export function AsciiColumnChart({
  series,
  labels,
  height = 10,
  max,
  glyphs = "shade",
  format = String,
  animate = true,
  label,
  className,
  ...props
}: AsciiColumnChartProps) {
  const [cursor, setCursor] = useState<number | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, { once: true, amount: 0.4 })
  const reduce = useReducedMotion()
  const play = animate && !reduce

  const count = labels.length
  const per = series.length
  const hi = max ?? Math.max(1, ...series.flatMap((s) => s.data))
  const color = (i: number) => series[i].className ?? COLORS[i % COLORS.length]
  const set = Array.from(columnGlyphs[glyphs as keyof typeof columnGlyphs] ?? glyphs)
  const blocky = isBlock(set[3])
  // A blank column separates groups; cells are 1ch with a 0.3ch gap, so a group is (per + 1) × 1.3ch wide.
  const column = (g: number, s: number) => 2 + g * (per + 1) + s
  const labelEvery = Math.ceil((Math.max(...labels.map((l) => l.length)) + 1) / ((per + 1) * 1.3))

  const middle = Math.floor(height / 2)
  const ticks = [
    [0, format(nice(hi, hi, 3))],
    [middle, format(nice((hi * (height - middle - 0.5)) / height, hi, 2))],
    [height - 1, format(0)],
  ] as const

  const shown = cursor ?? count - 1
  const readout = (i: number) => `${labels[i]}: ${series.map((s) => `${s.label} ${format(s.data[i] ?? 0)}`).join(", ")}`

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, (i: number) => number | null> = {
      ArrowLeft: (i) => Math.max(0, i - 1),
      ArrowRight: (i) => Math.min(count - 1, i + 1),
      Home: () => 0,
      End: () => count - 1,
      Escape: () => null,
    }
    const move = keys[e.key]
    if (!move || (e.key === "Escape" && cursor === null)) return
    e.preventDefault()
    setCursor(cursor === null && e.key.startsWith("Arrow") ? count - 1 : move(cursor ?? count - 1))
  }

  return (
    <div
      ref={root}
      role="group"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onBlur={() => setCursor(null)}
      className={cn("group block w-fit max-w-full font-mono leading-none whitespace-pre tabular-nums outline-none", className)}
      {...props}
    >
      <div className="flex flex-col gap-[0.75lh] rounded-sm group-focus-visible:ring-2 group-focus-visible:ring-ring/50">
        <div aria-hidden className="flex flex-wrap gap-x-[2ch] gap-y-[0.5lh] text-[0.85em]">
          <span className="text-muted-foreground">{labels[shown]}</span>
          {series.map((s, i) => (
            <span key={s.label}>
              <span className={color(i)}>■</span> {s.label} <span className="text-foreground">{format(s.data[shown] ?? 0)}</span>
            </span>
          ))}
        </div>
        <div
          aria-hidden
          className="grid gap-[0.3ch]"
          style={{ gridTemplateColumns: `auto repeat(${count * (per + 1) - 1}, 1ch)`, gridTemplateRows: `repeat(${height}, 1ch) auto` }}
          onPointerLeave={() => setCursor(null)}
        >
          {ticks.map(([row, text]) => (
            <span key={row} className="self-center pr-[0.75ch] text-right text-[0.85em] text-muted-foreground" style={{ gridColumn: 1, gridRow: row + 1 }}>
              {text}
            </span>
          ))}
          {labels.map((l, g) => {
            const dim = cursor !== null && cursor !== g
            return (
              <Fragment key={l}>
                {series.map((s, i) =>
                  bar(s.data[g] ?? 0, hi, height).map((level, row) => (
                    <motion.span
                      key={`${i}-${row}`}
                      onPointerEnter={() => setCursor(g)}
                      onPointerDown={() => setCursor(g)}
                      // A 1ch square keeps the cells square and evenly spaced in any font.
                      className={cn(
                        "block size-[1ch] text-center leading-[1ch]",
                        blocky && "overflow-hidden",
                        level ? color(i) : "text-muted-foreground/40",
                      )}
                      style={{ gridColumn: column(g, i), gridRow: height - row }}
                      initial={false}
                      animate={{ opacity: dim ? 0.3 : 1 }}
                      transition={{ duration: reduce ? 0 : 0.2 }}
                    >
                      {level ? (
                        <motion.span
                          className={cn("block", !blocky && "text-[0.85em]")}
                          initial={play ? { opacity: 0, y: "-60%" } : false}
                          animate={!play || inView ? { opacity: 1, y: "0%" } : { opacity: 0, y: "-60%" }}
                          transition={{ duration: 0.25, ease: EASE_OUT, delay: Math.min((g * per + i) * 0.03, 0.36) + row * 0.04 }}
                        >
                          {set[cursor === g && level === 3 ? 4 : level]}
                        </motion.span>
                      ) : (
                        set[0]
                      )}
                    </motion.span>
                  )),
                )}
                {g % labelEvery === 0 && (
                  <span
                    className={cn("justify-self-center pt-[0.5em] text-[0.85em] text-muted-foreground", cursor === g && "text-foreground")}
                    style={{ gridColumn: `${column(g, 0)} / span ${per}`, gridRow: height + 1 }}
                  >
                    {l}
                  </span>
                )}
              </Fragment>
            )
          })}
        </div>
        <table className="sr-only" aria-label={label}>
          <thead>
            <tr>
              <th scope="col">Group</th>
              {series.map((s) => (
                <th key={s.label} scope="col">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((l, g) => (
              <tr key={l}>
                <th scope="row">{l}</th>
                {series.map((s) => (
                  <td key={s.label}>{format(s.data[g] ?? 0)}</td>
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
