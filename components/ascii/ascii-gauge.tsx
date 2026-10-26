import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

// Bit for each dot of a braille cell, indexed [row][column] on its 2×4 grid.
const DOTS = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
]

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

/**
 * A dial in braille, `width` characters wide, as three text layers: the empty `track`, the `fill` up to `value`
 * (0 to 1) and tick `marks`. Dots are assumed square, which holds for a 0.6em-wide font at line-height 1.2.
 * The returned geometry is in dots, for placing labels on top.
 */
export function gauge(value: number, width: number, { sweep = 270, ticks = 0, thickness }: { sweep?: number; ticks?: number; thickness?: number } = {}) {
  const w = width * 2
  const margin = ticks ? 3 : 0.5
  const outer = w / 2 - margin
  const inner = outer - (thickness ?? Math.max(2, Math.round(outer * 0.28)))
  const cx = w / 2
  const cy = outer + margin
  const below = sweep > 180 ? (outer + margin) * Math.sin((((sweep - 180) / 2) * Math.PI) / 180) : 0
  const height = Math.ceil((cy + below) / 4)
  const h = height * 4
  const start = 90 + sweep / 2
  const filled = Math.min(1, Math.max(0, value))

  const track = new Uint8Array(width * height)
  const fill = new Uint8Array(width * height)
  const marks = new Uint8Array(width * height)
  const set = (cells: Uint8Array, x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    cells[(y >> 2) * width + (x >> 1)] |= DOTS[y & 3][x & 1]
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x + 0.5 - cx
      const dy = cy - y - 0.5
      const d = Math.hypot(dx, dy)
      if (d < inner || d > outer) continue
      const t = ((((start - (Math.atan2(dy, dx) * 180) / Math.PI) % 360) + 360) % 360) / sweep
      if (t <= 1) set(t <= filled && filled > 0 ? fill : track, x, y)
    }
  }
  // Points map to dots mirrored about the centre, so ticks come out symmetric; one on the centre line takes both middle dots.
  const columns = (x: number) => (Math.abs(x - cx) < 1e-6 ? [cx - 1, cx] : [x < cx ? Math.ceil(x) - 1 : Math.floor(x)])
  for (let k = 0; k <= ticks && ticks > 0; k++) {
    const a = ((start - (k / ticks) * sweep) * Math.PI) / 180
    for (let r = outer + 1; r <= outer + margin; r += 0.5) {
      for (const x of columns(cx + r * Math.cos(a))) set(marks, x, Math.ceil(cy - r * Math.sin(a)) - 1)
    }
  }

  return { track: toRows(track, width), fill: toRows(fill, width), marks: toRows(marks, width), cx, cy, outer, inner, w, h }
}

export type AsciiGaugeProps = Omit<ComponentProps<"div">, "children"> & {
  value: number
  min?: number
  max?: number
  /** Width in characters. The height follows from the sweep. */
  width?: number
  /** Arc length in degrees: 270 for a dial, 180 for a half circle. */
  sweep?: number
  /** Number of divisions marked around the outside. 0 hides them. */
  ticks?: number
  /** Arc thickness in braille dots. */
  thickness?: number
  /** Names the meter for screen readers and is shown under the value. */
  label: string
  format?: (value: number) => string
  /** Colour of the filled arc. */
  indicatorClassName?: string
  showRange?: boolean
}

export function AsciiGauge({
  value,
  min = 0,
  max = 100,
  width = 24,
  sweep = 270,
  ticks = 0,
  thickness,
  label,
  format = (v) => String(Math.round(v)),
  indicatorClassName,
  showRange = true,
  className,
  ...props
}: AsciiGaugeProps) {
  const clamped = Math.min(max, Math.max(min, value))
  const g = gauge((clamped - min) / (max - min || 1), width, { sweep, ticks, thickness })
  const pct = (dots: number, of: number) => `${(dots / of) * 100}%`
  // Where the arc ends sit horizontally, measured from the centre.
  const reach = ((g.outer + g.inner) / 2) * (sweep > 180 ? Math.cos((((sweep - 180) / 2) * Math.PI) / 180) : 1)
  return (
    <div
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={format(clamped)}
      aria-label={label}
      className={cn("inline-flex w-fit flex-col font-mono leading-[1.2] whitespace-pre tabular-nums", className)}
      {...props}
    >
      <div aria-hidden className="relative grid *:[grid-area:1/1]">
        <div className="text-muted-foreground/40">
          <Rows rows={g.track} />
        </div>
        <div className="text-muted-foreground">
          <Rows rows={g.marks} />
        </div>
        <div className={cn("text-primary", indicatorClassName)}>
          <Rows rows={g.fill} />
        </div>
        <div
          className={cn("absolute flex -translate-x-1/2 flex-col items-center", sweep > 180 ? "-translate-y-1/2" : "-translate-y-full")}
          style={{ left: pct(g.cx, g.w), top: pct(g.cy, g.h) }}
        >
          <span className="leading-none font-semibold text-foreground" style={{ fontSize: `${g.inner * 0.13}em` }}>
            {format(clamped)}
          </span>
          <span className="mt-[0.25lh] text-muted-foreground">{label}</span>
        </div>
      </div>
      {showRange && (
        <div aria-hidden className="relative h-[1lh] text-[0.85em] text-muted-foreground">
          <span className="absolute -translate-x-1/2" style={{ left: pct(g.cx - reach, g.w) }}>
            {format(min)}
          </span>
          <span className="absolute -translate-x-1/2" style={{ left: pct(g.cx + reach, g.w) }}>
            {format(max)}
          </span>
        </div>
      )}
    </div>
  )
}
