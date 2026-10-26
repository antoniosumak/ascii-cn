"use client"

import { useLayoutEffect, useRef, useState, type ComponentProps, type KeyboardEvent } from "react"

import { cn } from "@/lib/utils"

/** Looks for the cells, five glyphs each from empty to densest. Same as the column chart's. */
export const uptimeGlyphs = {
  shade: "·░▒▓█",
  hash: ".:+#@",
  dollar: "·.¢$$",
  diamond: "·⋄◇◆◈",
  circle: "·∘○●◉",
}

/** A preset name, or any five glyphs from empty to densest. */
export type UptimeGlyphs = keyof typeof uptimeGlyphs | (string & {})

/** Block elements (▀ to ▟) fill their cell and are clipped to it; other glyphs are drawn smaller so their full height shows. */
const isBlock = (glyph: string) => glyph >= "▀" && glyph <= "▟"

export type UptimeStatus = "up" | "degraded" | "down" | "none"

// `glyph` indexes the glyph set. Denser glyphs for worse days double the colour, so incidents stand out even without colour vision.
export const uptimeStatuses: Record<UptimeStatus, { label: string; glyph: number; className: string }> = {
  up: { label: "Operational", glyph: 2, className: "text-green-600 dark:text-green-400" },
  degraded: { label: "Degraded", glyph: 3, className: "text-amber-500" },
  down: { label: "Outage", glyph: 4, className: "text-destructive" },
  none: { label: "No data", glyph: 0, className: "text-muted-foreground/40" },
}

export type UptimeDatum = { label: string; status: UptimeStatus; note?: string }

/** Share of reported intervals that were up or degraded, 0 to 100. Intervals without data are left out. */
export function uptimePercent(data: UptimeDatum[]) {
  const known = data.filter((d) => d.status !== "none")
  return known.length ? (known.filter((d) => d.status !== "down").length / known.length) * 100 : 100
}

export type AsciiUptimeProps = Omit<ComponentProps<"div">, "children"> & {
  /** One entry per interval, oldest first. The oldest are dropped when the container is too narrow. */
  data: UptimeDatum[]
  /** Service name, shown above the bars and announced to screen readers. */
  label: string
  /** Overall uptime in percent. Defaults to `uptimePercent()` of the intervals shown. */
  uptime?: number
  /** Bar height in cells. */
  rows?: number
  /** How the cells look: a preset from `uptimeGlyphs`, or five glyphs: no data, unused, operational, degraded, outage. */
  glyphs?: UptimeGlyphs
  legend?: boolean
  /** Show the name and status above the bars and the date range and uptime below. Without it, bars get a native tooltip. */
  summary?: boolean
}

/** One bar per day or interval, coloured and sized by status, with a hover readout. */
export function AsciiUptime({
  data,
  label,
  uptime,
  rows = 2,
  glyphs = "shade",
  legend = true,
  summary = true,
  className,
  ...props
}: AsciiUptimeProps) {
  const [active, setActive] = useState<number | null>(null)
  const [fit, setFit] = useState(Number.POSITIVE_INFINITY)
  const root = useRef<HTMLDivElement>(null)
  const bars = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => {
      const bar = bars.current?.firstElementChild as HTMLElement | null
      // Bars are 1ch wide and sit 0.3ch apart.
      const gap = (bar?.offsetWidth ?? 0) * 0.3
      if (bar) setFit(Math.max(1, Math.floor((root.current!.clientWidth + gap) / (bar.offsetWidth + gap))))
    })
    observer.observe(root.current!)
    if (bars.current) observer.observe(bars.current)
    return () => observer.disconnect()
  }, [])
  const shown = data.slice(-Math.min(data.length, fit))
  const pct = uptime ?? uptimePercent(shown)
  const percent = `${pct === 100 ? "100" : pct.toFixed(2)}%`
  const current = shown.at(-1)
  const focused = active === null ? undefined : shown[active]
  const describe = (d: UptimeDatum) => [d.label, uptimeStatuses[d.status].label, d.note].filter(Boolean).join(" · ")
  const count = (s: UptimeStatus) => shown.filter((d) => d.status === s).length
  const set = Array.from(uptimeGlyphs[glyphs as keyof typeof uptimeGlyphs] ?? glyphs)
  const blocky = isBlock(set[3])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = shown.length - 1
    const keys: Record<string, (i: number) => number | null> = {
      ArrowLeft: (i) => Math.max(0, i - 1),
      ArrowRight: (i) => Math.min(last, i + 1),
      Home: () => 0,
      End: () => last,
      Escape: () => null,
    }
    const move = keys[e.key]
    if (!move || (e.key === "Escape" && active === null)) return
    e.preventDefault()
    setActive(active === null && e.key.startsWith("Arrow") ? last : move(active ?? last))
  }

  return (
    <div
      ref={root}
      role="group"
      aria-label={`${label}, ${percent} uptime`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onBlur={() => setActive(null)}
      // Inline-size containment lets the root take its container's width, which decides how many bars fit.
      className={cn("group block w-full font-mono whitespace-pre tabular-nums outline-none contain-inline-size", className)}
      {...props}
    >
      <div className="flex w-fit max-w-full flex-col gap-[0.5lh] rounded-sm group-focus-visible:ring-2 group-focus-visible:ring-ring/50">
        {/* Header, footer and legend take the bars' width rather than widening the chart. */}
        {summary ? (
          <div className="flex w-0 min-w-full justify-between gap-[2ch]">
            <span className="shrink-0 text-foreground">{label}</span>
            <span
              aria-live="polite"
              className={cn("truncate", !focused && current ? uptimeStatuses[current.status].className : "text-muted-foreground")}
            >
              {focused ? describe(focused) : current && uptimeStatuses[current.status].label}
            </span>
          </div>
        ) : (
          <span aria-live="polite" className="sr-only">
            {focused && describe(focused)}
          </span>
        )}
        <div ref={bars} aria-hidden className="flex gap-[0.3ch] leading-none" onPointerLeave={() => setActive(null)}>
          {shown.map((d, i) => (
            <span
              key={i}
              onPointerEnter={() => setActive(i)}
              title={summary ? undefined : describe(d)}
              className={cn(
                "flex flex-col transition-opacity motion-reduce:transition-none",
                active !== null && active !== i && "opacity-35",
              )}
            >
              {Array.from({ length: rows }, (_, r) => (
                // Cells exactly 1em tall with no gap, so block glyphs merge into one solid bar in any font.
                <span
                  key={r}
                  className={cn("block h-[1em] w-[1ch] text-center leading-none", blocky && "overflow-hidden", uptimeStatuses[d.status].className)}
                >
                  <span className={cn("block", !blocky && d.status !== "none" && "text-[0.85em]")}>{set[uptimeStatuses[d.status].glyph]}</span>
                </span>
              ))}
            </span>
          ))}
        </div>
        {summary && (
          <div aria-hidden className="flex w-0 min-w-full items-center gap-[1ch] text-[0.85em] text-muted-foreground">
            <span>{shown[0]?.label}</span>
            <span className="w-0 flex-1 overflow-hidden">{"─".repeat(200)}</span>
            <span className="text-foreground">{percent} uptime</span>
            <span className="w-0 flex-1 overflow-hidden">{"─".repeat(200)}</span>
            <span>{current?.label}</span>
          </div>
        )}
        {legend && (
          <div aria-hidden className="flex w-0 min-w-full flex-wrap gap-x-[2ch] text-[0.85em] text-muted-foreground">
            {(Object.keys(uptimeStatuses) as UptimeStatus[]).map((s) => (
              <span key={s}>
                <span className={uptimeStatuses[s].className}>{set[uptimeStatuses[s].glyph]}</span> {uptimeStatuses[s].label.toLowerCase()}
              </span>
            ))}
          </div>
        )}
        <p className="sr-only">
          {`${shown.length} intervals from ${shown[0]?.label} to ${current?.label}: ${count("down")} with an outage, ${count("degraded")} degraded.`}
        </p>
      </div>
    </div>
  )
}
