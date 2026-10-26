"use client"

import { AsciiCanvas } from "@/lib/ascii"

export function OrbitDemo() {
  return (
    <AsciiCanvas
      aria-hidden
      opacity
      className="text-primary"
      field={(x, y, t, s) => {
        const dx = (x - 0.5 - 0.25 * Math.cos(t)) * s.aspect
        const dy = y - 0.5 - 0.25 * Math.sin(t)
        return Math.max(0, 1 - Math.hypot(dx, dy) * 4)
      }}
    />
  )
}
