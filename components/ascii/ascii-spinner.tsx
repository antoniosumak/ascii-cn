"use client"

import { useEffect, useState, type ComponentProps } from "react"

import { cn } from "@/lib/utils"

export const spinners = {
  braille: { frames: "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏", interval: 80 },
  line: { frames: "|/-\\", interval: 100 },
  arc: { frames: "◜◠◝◞◡◟", interval: 100 },
  quadrant: { frames: "▖▘▝▗", interval: 120 },
  bounce: { frames: "⠁⠂⠄⡀⢀⠠⠐⠈", interval: 90 },
  pulse: { frames: " ·•●•·", interval: 140 },
  grow: { frames: "▁▂▃▄▅▆▇█▇▆▅▄▃▂", interval: 80 },
} as const

export type AsciiSpinnerProps = Omit<ComponentProps<"span">, "children"> & {
  variant?: keyof typeof spinners
  /** Announced to screen readers. */
  label?: string
}

export function AsciiSpinner({ variant = "braille", label = "Loading", className, ...props }: AsciiSpinnerProps) {
  const { frames, interval } = spinners[variant]
  const [i, setI] = useState(0)

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => setI((n) => n + 1), interval)
    return () => clearInterval(id)
  }, [interval])

  return (
    <span role="status" className={cn("inline-block font-mono", className)} {...props}>
      <span aria-hidden>{frames[i % frames.length]}</span>
      <span className="sr-only">{label}</span>
    </span>
  )
}
