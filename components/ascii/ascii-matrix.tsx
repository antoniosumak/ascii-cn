"use client"

import { useRef } from "react"

import { AsciiCanvas, charsets, type AsciiCanvasProps, type AsciiFrame } from "@/lib/ascii"
import { cn } from "@/lib/utils"

export type AsciiMatrixProps = Omit<AsciiCanvasProps, "field" | "frame" | "source"> & {
  /** Characters the rain is made of. */
  glyphs?: string
  /** Rows per second for an average drop. */
  speed?: number
  /** 0 to 1, share of columns with a falling drop. */
  density?: number
}

type Drop = { y: number; speed: number; length: number }

export function AsciiMatrix({
  glyphs = charsets.katakana.trim() + "0123456789",
  speed = 14,
  density = 0.7,
  className,
  ...props
}: AsciiMatrixProps) {
  const drops = useRef<Drop[]>([])
  const last = useRef(0)
  const codes = Array.from(glyphs, (c) => c.charCodeAt(0))

  // Lower density starts drops further above the top edge, which leaves longer gaps between them.
  const spawn = (rows: number, onScreen: boolean): Drop => ({
    y: onScreen ? Math.random() * rows : (-Math.random() * rows) / Math.max(0.05, density),
    speed: speed * (0.5 + Math.random()),
    length: 6 + Math.random() * rows * 0.6,
  })

  const frame: AsciiFrame = (f, t) => {
    const dt = Math.min(0.1, Math.max(0, t - last.current))
    last.current = t
    if (drops.current.length !== f.cols) {
      drops.current = Array.from({ length: f.cols }, () => spawn(f.rows, true))
    }
    for (let c = 0; c < f.cols; c++) {
      const d = drops.current[c]
      d.y += d.speed * dt
      if (d.y - d.length > f.rows) drops.current[c] = spawn(f.rows, false)
      const head = Math.floor(d.y)
      for (let k = 0; k < d.length; k++) {
        const r = head - k
        if (r < 0 || r >= f.rows) continue
        const i = r * f.cols + c
        f.tone[i] = k === 0 ? 1 : 0.9 * (1 - k / d.length)
        // Glyphs flicker at their own pace instead of scrolling with the drop.
        const seed = (c * 7919 + r * 104729 + Math.floor(t * (2 + (c % 5)))) % codes.length
        f.glyph[i] = codes[seed]
      }
    }
  }

  return (
    <AsciiCanvas
      aria-hidden
      role="presentation"
      frame={frame}
      opacity
      className={cn("pointer-events-none", className)}
      {...props}
    />
  )
}
