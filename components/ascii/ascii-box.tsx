import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

const borders = {
  single: "┌┐└┘─│",
  double: "╔╗╚╝═║",
  round: "╭╮╰╯─│",
  heavy: "┏┓┗┛━┃",
  ascii: "++++-|",
} as const

export type AsciiBoxProps = ComponentProps<"div"> & {
  variant?: keyof typeof borders
  title?: ReactNode
}

/**
 * A box-drawing frame that stretches to any size. Edges are repeated with CSS,
 * so it never measures text and the corners stay aligned on the character grid.
 */
export function AsciiBox({ variant = "single", title, className, children, ...props }: AsciiBoxProps) {
  const [tl, tr, bl, br, h, v] = borders[variant]
  const line = (ch: string) => (
    <span aria-hidden className="min-w-0 flex-1 overflow-hidden whitespace-pre">
      {ch.repeat(400)}
    </span>
  )
  // Absolutely positioned so the 200-glyph column never adds to the row height.
  const side = (
    <div aria-hidden className="relative">
      <div className="absolute inset-0 overflow-hidden whitespace-pre">{`${v}
`.repeat(200)}</div>
    </div>
  )
  return (
    <div className={cn("grid grid-cols-[1ch_1fr_1ch] font-mono leading-none", className)} {...props}>
      <span aria-hidden>{tl}</span>
      <div className="flex min-w-0">
        {h}
        {title && <span className="px-[1ch] whitespace-pre">{title}</span>}
        {line(h)}
      </div>
      <span aria-hidden>{tr}</span>
      {side}
      <div className="min-w-0 px-[1ch] py-[1lh] leading-normal">{children}</div>
      {side}
      <span aria-hidden>{bl}</span>
      {line(h)}
      <span aria-hidden>{br}</span>
    </div>
  )
}
