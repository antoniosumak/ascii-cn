"use client"

import { useEffect, useRef, useState, type ComponentProps, type CSSProperties, type ReactNode } from "react"

import { AsciiCanvas, type AsciiCanvasProps } from "@/lib/ascii"
import { cn } from "@/lib/utils"

type WordStyle = Pick<AsciiCanvasProps, "charset" | "fontSize" | "color" | "dither" | "opacity"> & {
  /** CSS font used to rasterise each word before it is filled with glyphs. */
  font?: string
}

export type AsciiMarqueeProps = Omit<ComponentProps<"div">, "children" | "color"> &
  WordStyle & {
    /** Words or wordmarks, each drawn in glyphs. */
    items?: string[]
    /** Your own items instead, e.g. SVG logos or `AsciiImage`s. Each direct child is one item. */
    children?: ReactNode
    /** Pixels per second. */
    speed?: number
    direction?: "left" | "right"
    /** Space between items in pixels. */
    gap?: number
    /** Height of each word in pixels. */
    size?: number
    /** Width of the fade at each edge in pixels. 0 turns it off. */
    fade?: number
    pauseOnHover?: boolean
  }

const keyframes = "@keyframes asciicn-marquee{to{transform:translateX(-50%)}}"

function Word({ text, font = "900 160px ui-sans-serif, system-ui, sans-serif", ...props }: WordStyle & { text: string }) {
  const [mask, setMask] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let live = true
    document.fonts.ready.then(() => {
      if (!live) return
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      ctx.font = font
      const m = ctx.measureText(text)
      // Shared vertical bounds keep every word at one x-height, whether or not it has ascenders or descenders.
      const ref = ctx.measureText("Hbdfhklgjpqy")
      const ascent = Math.max(m.actualBoundingBoxAscent, ref.actualBoundingBoxAscent)
      const descent = Math.max(m.actualBoundingBoxDescent, ref.actualBoundingBoxDescent)
      canvas.width = Math.ceil(m.width)
      canvas.height = Math.ceil(ascent + descent)
      ctx.font = font
      ctx.fillStyle = "#fff"
      ctx.fillText(text, 0, ascent)
      setMask(canvas)
    })
    return () => {
      live = false
    }
  }, [text, font])

  return (
    <div className="relative h-(--size)" style={{ aspectRatio: mask ? `${mask.width} / ${mask.height}` : "4 / 1" }}>
      <AsciiCanvas source={mask} ink="light" fit="contain" aria-label={text} className="absolute inset-0" {...props} />
    </div>
  )
}

/** An endless row of words or logos. Pauses on hover and focus; holds still under reduced motion. */
export function AsciiMarquee({
  items,
  children,
  speed = 40,
  direction = "left",
  gap = 48,
  size = 40,
  fade = 64,
  pauseOnHover = true,
  font,
  charset = "braille",
  fontSize = 4,
  color,
  dither,
  opacity,
  className,
  style,
  ...props
}: AsciiMarqueeProps) {
  const root = useRef<HTMLDivElement>(null)
  const first = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState({ copies: 1, width: 0 })

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const width = first.current!.offsetWidth
      if (!width) return
      // Each half of the track must be at least as wide as the view, or a gap shows before it wraps.
      const copies = Math.max(1, Math.ceil(root.current!.offsetWidth / width))
      setLayout((l) => (l.copies === copies && l.width === width ? l : { copies, width }))
    })
    ro.observe(root.current!)
    ro.observe(first.current!)
    return () => ro.disconnect()
  }, [])

  const content = items
    ? items.map((text, i) => (
        <div key={`${text}-${i}`} role="listitem">
          <Word text={text} font={font} charset={charset} fontSize={fontSize} color={color} dither={dither} opacity={opacity} />
        </div>
      ))
    : children

  const set = (key: number) => (
    <div
      key={key}
      ref={key === 0 ? first : undefined}
      role={items && key === 0 ? "list" : undefined}
      aria-hidden={key > 0 || undefined}
      inert={key > 0}
      className={cn(
        "flex shrink-0 items-center gap-(--gap) pr-(--gap) motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-4 motion-reduce:pr-0 [&>*]:shrink-0",
        key > 0 && "motion-reduce:hidden",
      )}
    >
      {content}
    </div>
  )
  const half = (offset: number) => Array.from({ length: layout.copies }, (_, i) => set(offset + i))

  return (
    <div
      ref={root}
      className={cn(
        // Containment keeps the repeated track out of the intrinsic width, so the copy count cannot feed back into it.
        "group/marquee flex w-full overflow-hidden [contain:inline-size]",
        fade > 0 &&
          "[mask-image:linear-gradient(to_right,transparent,#000_var(--fade),#000_calc(100%-var(--fade)),transparent)] motion-reduce:[mask-image:none]",
        className,
      )}
      style={{ "--gap": `${gap}px`, "--size": `${size}px`, "--fade": `${fade}px`, ...style } as CSSProperties}
      {...props}
    >
      <style href="asciicn-marquee" precedence="default">
        {keyframes}
      </style>
      <div
        className={cn(
          "flex w-max shrink-0 animate-[asciicn-marquee_var(--duration)_linear_infinite] motion-reduce:w-full motion-reduce:animate-none",
          pauseOnHover &&
            "group-focus-within/marquee:[animation-play-state:paused] group-hover/marquee:[animation-play-state:paused]",
        )}
        style={
          {
            "--duration": `${layout.width ? (layout.width * layout.copies) / speed : 30}s`,
            animationDirection: direction === "right" ? "reverse" : undefined,
          } as CSSProperties
        }
      >
        {half(0)}
        {half(layout.copies)}
      </div>
    </div>
  )
}
