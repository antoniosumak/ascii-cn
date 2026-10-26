"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"

import { AsciiCanvas, type AsciiCanvasProps } from "@/lib/ascii"
import { cn } from "@/lib/utils"

export type AsciiScrollRevealProps = Omit<AsciiCanvasProps, "source" | "fontSize" | "onProgress"> & {
  src: string
  alt: string
  /** Cell size in CSS pixels as the image enters from below. */
  from?: number
  /** Cell size once the image reaches the middle of the scroll area. */
  to?: number
  /** "photo" cross-fades to the original over the last stretch, "ascii" stays glyphs. */
  reveal?: "photo" | "ascii"
  onProgress?: (progress: number) => void
}

function scrollParent(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    if (p.scrollHeight > p.clientHeight && /(auto|scroll|overlay)/.test(getComputedStyle(p).overflowY)) return p
  }
  return null
}

/** Coarse glyphs that resolve into the photo as the image scrolls toward the middle of its scroll area. */
export function AsciiScrollReveal({
  src,
  alt,
  from = 32,
  to = 6,
  reveal = "photo",
  onProgress,
  className,
  ...props
}: AsciiScrollRevealProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [fontSize, setFontSize] = useState(from)
  const root = useRef<HTMLDivElement>(null)

  const apply = useEffectEvent((p: number) => {
    root.current!.style.setProperty("--reveal", String(p))
    // Geometric steps feel even, and whole pixels keep canvas redraws to a few dozen over the whole scroll.
    setFontSize(Math.round(from * Math.pow(to / from, p)))
    onProgress?.(p)
  })

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => setImage(img)
    img.src = src
    return () => {
      img.onload = null
    }
  }, [src])

  useEffect(() => {
    const el = root.current!
    const reduce = matchMedia("(prefers-reduced-motion: reduce)")
    const scroller = scrollParent(el)
    const target: HTMLElement | Window = scroller ?? window
    let raf = 0

    const measure = () => {
      raf = 0
      let p = 1
      if (!reduce.matches) {
        const r = el.getBoundingClientRect()
        const view = scroller ? scroller.getBoundingClientRect() : { top: 0, height: innerHeight }
        // 0 when the top edge enters from below, 1 once the centre reaches the middle of the view.
        p = (view.top + view.height - r.top) / (view.height / 2 + r.height / 2)
        p = Math.min(1, Math.max(0, p))
      }
      apply(p)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          target.addEventListener("scroll", schedule, { passive: true })
          window.addEventListener("resize", schedule)
        } else {
          target.removeEventListener("scroll", schedule)
          window.removeEventListener("resize", schedule)
        }
        schedule()
      },
      { root: scroller },
    )

    io.observe(el)
    reduce.addEventListener("change", schedule)
    measure()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      reduce.removeEventListener("change", schedule)
      target.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [from, to])

  return (
    <div
      ref={root}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: image ? `${image.naturalWidth} / ${image.naturalHeight}` : "1" }}
    >
      <AsciiCanvas source={image} fontSize={fontSize} aria-label={alt} className="absolute inset-0" {...props} />
      {reveal === "photo" && (
        // eslint-disable-next-line @next/next/no-img-element -- crossfade target must be the same file the canvas samples
        <img
          src={src}
          alt=""
          className="absolute inset-0 size-full object-cover"
          style={{ opacity: "clamp(0, (var(--reveal, 0) - 0.75) * 4, 1)" }}
        />
      )}
    </div>
  )
}
