import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const styles = {
  // Eighth blocks give eight steps of precision inside a single character.
  blocks: { fill: "█", partial: " ▏▎▍▌▋▊▉", empty: " ", open: "▕", close: "▏" },
  shade: { fill: "█", partial: "░▒▓", empty: "░", open: "", close: "" },
  hash: { fill: "#", partial: "", empty: ".", open: "[", close: "]" },
  arrow: { fill: "=", partial: ">", empty: " ", open: "[", close: "]" },
  dots: { fill: "●", partial: "", empty: "○", open: "", close: "" },
} as const

export function progressBar(value: number, width: number, variant: keyof typeof styles = "blocks") {
  const s = styles[variant]
  const v = Math.min(1, Math.max(0, value)) * width
  const full = Math.floor(v)
  let bar = s.fill.repeat(full)
  if (full < width) {
    bar += s.partial ? s.partial[Math.floor((v - full) * s.partial.length)] : s.empty
    bar += s.empty.repeat(width - full - 1)
  }
  return s.open + bar + s.close
}

export type AsciiProgressProps = Omit<ComponentProps<"div">, "children"> & {
  /** 0 to 100. */
  value: number
  /** Bar width in characters. */
  width?: number
  variant?: keyof typeof styles
  label?: string
  showValue?: boolean
}

export function AsciiProgress({
  value,
  width = 24,
  variant = "blocks",
  label,
  showValue = true,
  className,
  ...props
}: AsciiProgressProps) {
  const pct = Math.round(Math.min(100, Math.max(0, value)))
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
      className={cn("flex items-center gap-[1ch] font-mono whitespace-pre tabular-nums", className)}
      {...props}
    >
      {label && <span className="text-muted-foreground">{label}</span>}
      <span aria-hidden>{progressBar(value / 100, width, variant)}</span>
      {showValue && <span aria-hidden>{String(pct).padStart(3)}%</span>}
    </div>
  )
}
