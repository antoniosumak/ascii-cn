"use client"

import { AsciiCanvas, type AsciiCanvasProps, type AsciiField } from "@/lib/ascii"
import { cn } from "@/lib/utils"

const fract = (v: number) => v - Math.floor(v)
const smooth = (t: number) => t * t * (3 - 2 * t)
const hash = (x: number, y: number) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453)

function noise(x: number, y: number) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const u = smooth(x - ix)
  const v = smooth(y - iy)
  const a = hash(ix, iy)
  const b = hash(ix + 1, iy)
  const c = hash(ix, iy + 1)
  const d = hash(ix + 1, iy + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

function fbm(x: number, y: number) {
  let sum = 0
  let amp = 0.5
  for (let i = 0; i < 4; i++) {
    sum += amp * noise(x, y)
    x *= 2.03
    y *= 2.03
    amp *= 0.5
  }
  return sum / 0.9375
}

export const backgrounds = {
  plasma: (x, y, t, s) => {
    const X = x * s.aspect * 6
    const Y = y * 6
    const v =
      Math.sin(X + t) +
      Math.sin(Y + t * 1.3) +
      Math.sin((X + Y) * 0.5 + t * 0.7) +
      Math.sin(Math.hypot(X - 3 * s.aspect, Y - 3) - t * 1.5)
    return (v / 4 + 1) / 2
  },
  topography: (x, y, t, s) => {
    const n = fbm(x * s.aspect * 2.5 + t * 0.03, y * 2.5 - t * 0.02)
    const band = fract(n * 9)
    const line = 1 - Math.min(1, Math.min(band, 1 - band) / 0.09)
    return Math.max(line, n * 0.25)
  },
  clouds: (x, y, t, s) => {
    const n = fbm(x * s.aspect * 3 + t * 0.15, y * 3 + Math.sin(t * 0.1))
    return smooth(Math.min(1, Math.max(0, (n - 0.3) * 1.8)))
  },
  ripple: (x, y, t, s) => {
    const cx = s.mouse.active ? s.mouse.x : 0.5
    const cy = s.mouse.active ? s.mouse.y : 0.5
    const d = Math.hypot((x - cx) * s.aspect, y - cy)
    return (0.5 + 0.5 * Math.sin(d * 40 - t * 5)) * Math.exp(-d * 2.2)
  },
  tunnel: (x, y, t, s) => {
    const dx = (x - 0.5) * s.aspect
    const dy = y - 0.5
    const r = Math.hypot(dx, dy)
    const a = Math.atan2(dy, dx)
    const v = Math.sin(a * 6 + t) * Math.sin(1.2 / r + t * 3)
    return (0.5 + 0.5 * v) * Math.min(1, r * 3)
  },
  rain: (x, y, t, s) => {
    const col = Math.floor(x * s.cols)
    const speed = 0.3 + hash(col, 1) * 0.6
    const head = fract(t * speed * 0.25 + hash(col, 7))
    const d = fract(head - y)
    return d < 0.3 ? 1 - d / 0.3 : 0
  },
  starfield: (x, y, t, s) => {
    const dx = (x - 0.5) * s.aspect
    const dy = y - 0.5
    const r = Math.hypot(dx, dy) + 1e-4
    // In log-polar space a constant scroll reads as stars accelerating out of a vanishing point.
    const u = (Math.atan2(dy, dx) / (Math.PI * 2) + 0.5) * 40
    const v = Math.log(r) * 6 - t * 1.2
    const iu = Math.floor(u)
    const iv = Math.floor(v)
    if (hash(iu, iv) > 0.3) return 0
    const du = (u - iu - 0.2 - hash(iu, iv + 3) * 0.6) * 0.157 * r
    const dv = (v - iv - 0.2 - hash(iu + 5, iv) * 0.6) * 0.067 * r
    const star = Math.max(0, 1 - Math.hypot(du, dv) / (0.008 + 0.03 * r))
    return star * Math.min(1, r * 4)
  },
  metaballs: (x, y, t, s) => {
    const X = x * s.aspect
    let sum = 0
    for (let i = 0; i < 4; i++) {
      const bx = (0.5 + 0.38 * Math.sin(t * (0.31 + i * 0.07) + i * 2.1)) * s.aspect
      const by = 0.5 + 0.34 * Math.cos(t * (0.27 + i * 0.05) + i * 1.7)
      const dx = X - bx
      const dy = y - by
      sum += 0.015 / (dx * dx + dy * dy + 1e-4)
    }
    return smooth(Math.min(1, Math.max(0, (sum - 0.35) / 1.4)))
  },
  grid: (x, y, t, s) => {
    const horizon = 0.4
    const h = y - horizon
    if (h <= 0) return Math.max(0, 1 + h * 12) * 0.25
    const z = 0.5 / h
    const gz = fract(z + t * 0.8)
    const gx = fract((x - 0.5) * s.aspect * z * 3)
    // Work in cells so lines stay one cell wide at any depth and fade out before they are packed tighter than the grid.
    const rowsPerZ = s.rows / (2 * z * z)
    const colsPerX = s.cols / s.aspect / (3 * z)
    const across = Math.max(0, 1 - Math.min(gz, 1 - gz) * rowsPerZ) * Math.min(1, Math.max(0, (rowsPerZ - 2) / 4))
    const along = Math.max(0, 1 - Math.min(gx, 1 - gx) * colsPerX * 0.6) * Math.min(1, Math.max(0, (colsPerX - 2) / 4))
    return Math.max(across, along) * Math.min(1, h * 5)
  },
  waves: (x, y, t, s) => {
    const X = x * s.aspect
    let ink = 0
    for (let i = 0; i < 5; i++) {
      const c = 0.2 + i * 0.15 + 0.05 * Math.sin(X * (2 + i * 0.7) + t * (0.6 + i * 0.15) + i) + 0.02 * Math.sin(X * 7 - t * 1.1 + i * 3)
      ink = Math.max(ink, Math.max(0, 1 - Math.abs(y - c) / 0.04) * (0.45 + i * 0.13))
    }
    return ink
  },
  aurora: (x, y, t, s) => {
    const X = x * s.aspect + 0.12 * Math.sin(y * 3 + t * 0.5) + 0.08 * Math.sin(t * 0.23 + x * 5)
    const folds = 0.5 + 0.5 * Math.sin(X * 6 + 1.5 * Math.sin(X * 2.3 + t * 0.4))
    const rays = 0.6 + 0.4 * noise(X * 18, y * 0.8 + t * 0.2)
    const bottom = 0.55 + 0.2 * noise(X * 2, t * 0.15)
    const fade = smooth(Math.min(1, Math.max(0, (bottom - y) / 0.35)))
    return folds * folds * rays * fade * (1 - y * 0.6)
  },
} satisfies Record<string, AsciiField>

export type AsciiBackgroundProps = Omit<AsciiCanvasProps, "field" | "frame" | "source"> & {
  variant?: keyof typeof backgrounds
  /** Time multiplier. */
  speed?: number
}

export function AsciiBackground({
  variant = "plasma",
  speed = 1,
  opacity = true,
  className,
  ...props
}: AsciiBackgroundProps) {
  const field = backgrounds[variant]
  return (
    <AsciiCanvas
      aria-hidden
      role="presentation"
      field={(x, y, t, s) => field(x, y, t * speed, s)}
      opacity={opacity}
      className={cn("pointer-events-none", className)}
      {...props}
    />
  )
}
