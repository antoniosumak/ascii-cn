import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const sizes = {
  sm: "h-7 text-xs",
  default: "h-8 text-sm",
  lg: "h-9 text-base",
} as const

// Named group, so a hover on some outer `.group` never animates the frame.
const lit = "group-hover/ascii-button:opacity-100 group-focus-visible/ascii-button:opacity-100"
const frame = cn(
  "opacity-50 transition-[opacity,translate] duration-150 ease-out motion-reduce:transition-none",
  lit,
)
const atRest = "group-hover/ascii-button:hidden group-focus-visible/ascii-button:hidden"
const onHover = "hidden group-hover/ascii-button:inline group-focus-visible/ascii-button:inline"
const run = (ch: string) => ch.repeat(400)

/** Swaps a glyph for its heavy twin while the button is hovered or focused. */
function Heavy({ thin, heavy }: { thin: string; heavy: string }) {
  return (
    <>
      <span className={atRest}>{thin}</span>
      <span className={onHover}>{heavy}</span>
    </>
  )
}

function BoxEdge({ glyphs: [l, h, r], heavy: [hl, hh, hr] }: { glyphs: string; heavy: string }) {
  return (
    <span aria-hidden className="flex min-w-0 items-center leading-[0.5]">
      <Heavy thin={l} heavy={hl} />
      {/* Absolute, so the 400-glyph edge never counts toward the button's width. */}
      <span className="relative flex-1 self-stretch">
        <span className="absolute inset-0 flex items-center overflow-hidden">
          <Heavy thin={run(h)} heavy={run(hh)} />
        </span>
      </span>
      <Heavy thin={r} heavy={hr} />
    </span>
  )
}

export type AsciiButtonProps = ComponentProps<"button"> & {
  variant?: "brackets" | "box" | "arrow" | "underline"
  size?: keyof typeof sizes
}

/** A real `<button>` with a glyph frame that animates on hover and keyboard focus. */
export function AsciiButton({
  variant = "brackets",
  size = "default",
  type = "button",
  className,
  children,
  ...props
}: AsciiButtonProps) {
  return (
    <button
      type={type}
      data-variant={variant}
      className={cn(
        "group/ascii-button relative inline-flex shrink-0 items-center justify-center rounded-md font-mono font-medium whitespace-pre outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
        sizes[size],
        variant === "arrow" && "px-[1ch]",
        variant === "underline" && "px-[1ch] pb-[0.2em]",
        className,
      )}
      {...props}
    >
      {variant === "brackets" && (
        <>
          {/* Brackets rest 1ch inside their slots and step out to them, so the button never changes width. */}
          <span aria-hidden className={cn(frame, "translate-x-[1ch] group-hover/ascii-button:translate-x-0 group-focus-visible/ascii-button:translate-x-0")}>
            [
          </span>
          <span className="px-[2ch]">{children}</span>
          <span aria-hidden className={cn(frame, "-translate-x-[1ch] group-hover/ascii-button:translate-x-0 group-focus-visible/ascii-button:translate-x-0")}>
            ]
          </span>
        </>
      )}
      {variant === "box" && (
        // Full strength at rest: box glyphs overlap at the joins, and translucent overlaps would show as bright spots.
        <span className="grid h-full w-full grid-rows-[0.5em_1fr_0.5em]">
          <BoxEdge glyphs="┌─┐" heavy="┏━┓" />
          <span className="flex items-center">
            <span aria-hidden>
              <Heavy thin="│" heavy="┃" />
            </span>
            <span className="flex-1 px-[1ch] text-center leading-none">{children}</span>
            <span aria-hidden>
              <Heavy thin="│" heavy="┃" />
            </span>
          </span>
          <BoxEdge glyphs="└─┘" heavy="┗━┛" />
        </span>
      )}
      {variant === "arrow" && (
        <>
          <span aria-hidden className={frame}>
            {">"}
          </span>
          <span className="pl-[1ch]">{children}</span>
          <span aria-hidden className="opacity-0 group-hover/ascii-button:opacity-100 group-focus-visible/ascii-button:opacity-100 motion-safe:group-hover/ascii-button:animate-caret-blink motion-safe:group-focus-visible/ascii-button:animate-caret-blink">
            _
          </span>
        </>
      )}
      {variant === "underline" && (
        <>
          {children}
          <span aria-hidden className="absolute inset-x-[1ch] bottom-[0.15em] overflow-hidden leading-[0.5]">
            <span className="block opacity-30">{run("─")}</span>
            {/* Steps make the heavy line type itself in rather than glide. */}
            <span className="absolute inset-0 block opacity-100 [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-300 ease-[steps(8,end)] group-hover/ascii-button:[clip-path:inset(0)] group-focus-visible/ascii-button:[clip-path:inset(0)] motion-reduce:transition-none">
              {run("━")}
            </span>
          </span>
        </>
      )}
    </button>
  )
}
