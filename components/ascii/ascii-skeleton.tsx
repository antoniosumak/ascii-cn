"use client"

import { useSyncExternalStore, type ComponentProps } from "react"

import { cn } from "@/lib/utils"

const shades = "░▒▓"
// Wave crests repeat every PERIOD glyphs, so even a narrow skeleton sees one pass by regularly.
const PERIOD = 36
const BAND = 5
const SPEED = 28

// One shared clock: every skeleton on the page ticks together and the wave lines up across them.
let tick = -1
let timer: ReturnType<typeof setInterval> | undefined
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!timer && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    timer = setInterval(() => {
      tick = performance.now() / 1000
      listeners.forEach((l) => l())
    }, 60)
  }
  return () => {
    listeners.delete(listener)
    if (!listeners.size) {
      clearInterval(timer)
      timer = undefined
      tick = -1
    }
  }
}

function shadeRow(length: number, row: number, t: number) {
  if (t < 0) return shades[0].repeat(length)
  const crest = (t * SPEED) % PERIOD
  let out = ""
  for (let x = 0; x < length; x++) {
    // Rows are offset so the crest sweeps diagonally.
    const d = Math.abs(((x - row * 2 - crest) % PERIOD) + PERIOD) % PERIOD
    const dist = Math.min(d, PERIOD - d)
    out += shades[dist < BAND ? Math.round((1 - dist / BAND) * 2) : 0]
  }
  return out
}

const textWidths = [1, 0.94, 0.98, 0.9, 0.96]

export type AsciiSkeletonProps = Omit<ComponentProps<"div">, "children"> & {
  variant?: "text" | "block" | "avatar"
  /** Rows of glyphs. */
  lines?: number
  /** Characters as a number, or any CSS width as a string. */
  width?: number | string
}

export function AsciiSkeleton({ variant = "text", lines, width, className, style, ...props }: AsciiSkeletonProps) {
  const t = useSyncExternalStore(
    subscribe,
    () => tick,
    () => -1,
  )
  const rows = lines ?? (variant === "text" ? 3 : 2)
  const w = width ?? (variant === "avatar" ? 4 : "100%")
  const chars = typeof w === "number" ? w : 240
  const share = (i: number) =>
    variant !== "text" || rows === 1 ? 1 : i === rows - 1 ? 0.6 : textWidths[i % textWidths.length]

  return (
    <div
      aria-hidden
      className={cn(
        "flex flex-col overflow-hidden font-mono leading-none whitespace-pre select-none",
        variant === "text" && "gap-[0.6em]",
        // Without containment the 240-glyph rows would set the intrinsic width and push a flex parent wide.
        typeof w === "number" ? "w-fit" : "contain-inline-size",
        className,
      )}
      style={{ width: typeof w === "string" ? w : undefined, ...style }}
      {...props}
    >
      {Array.from({ length: rows }, (_, i) => (
        <span key={i} className="overflow-hidden" style={typeof w === "string" ? { width: `${share(i) * 100}%` } : undefined}>
          {shadeRow(typeof w === "string" ? chars : Math.round(chars * share(i)), i, t)}
        </span>
      ))}
    </div>
  )
}
