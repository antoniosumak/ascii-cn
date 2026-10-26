import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

export const dividers = {
  single: "─",
  double: "═",
  heavy: "━",
  dashed: "╌",
  dotted: "┈",
  ascii: "-",
  wave: "∿",
  tilde: "~",
  dots: "·",
  beads: "•·",
  chevron: "<>",
  zigzag: "/\\",
  overline: "▔",
} as const

export type AsciiDividerProps = Omit<ComponentProps<"div">, "children"> & {
  variant?: keyof typeof dividers
  /** Your own repeating pattern, overrides `variant`. */
  glyphs?: string
  label?: ReactNode
  align?: "start" | "center" | "end"
}

/** A rule that fills its container by repeating glyphs with overflow hidden, so it never measures text. */
export function AsciiDivider({ variant = "single", glyphs, label, align = "center", className, ...props }: AsciiDividerProps) {
  const pattern = glyphs || dividers[variant]
  const run = pattern.repeat(Math.ceil(400 / pattern.length))
  const stub = <span aria-hidden>{pattern.repeat(Math.ceil(2 / pattern.length))}</span>
  // The leading line clips on its left so a multi-glyph pattern still meets the label whole.
  const lead = (
    <span aria-hidden className="flex min-w-0 flex-1 justify-end overflow-hidden">
      <span className="shrink-0">{run}</span>
    </span>
  )
  const tail = (
    <span aria-hidden className="min-w-0 flex-1 overflow-hidden">
      {run}
    </span>
  )
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label={typeof label === "string" ? label : undefined}
      // Contained so the 400-glyph runs never become the intrinsic width of a grid or shrink-to-fit parent.
      className={cn(
        "flex w-full min-w-0 items-center font-mono leading-none whitespace-pre select-none contain-inline-size",
        className,
      )}
      {...props}
    >
      {label == null ? (
        tail
      ) : (
        <>
          {align === "start" ? stub : lead}
          <span className="shrink-0 px-[1ch]">{label}</span>
          {align === "end" ? stub : tail}
        </>
      )}
    </div>
  )
}
