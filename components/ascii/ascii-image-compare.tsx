"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { AsciiCanvas, type AsciiCanvasProps } from "@/lib/ascii"
import { cn } from "@/lib/utils"

export type AsciiImageCompareProps = Omit<AsciiCanvasProps, "source"> & {
  src: string
  alt: string
  /** Divider position from the left edge, 0 to 100. Pass it to control the slider. */
  position?: number
  defaultPosition?: number
  onPositionChange?: (position: number) => void
}

const clamp = (n: number) => Math.min(100, Math.max(0, n))

/** The photo on the left of a draggable divider, its ASCII version on the right. */
export function AsciiImageCompare({
  src,
  alt,
  position,
  defaultPosition = 50,
  onPositionChange,
  className,
  ...props
}: AsciiImageCompareProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [inner, setInner] = useState(defaultPosition)
  const root = useRef<HTMLDivElement>(null)
  const handle = useRef<HTMLDivElement>(null)
  const pos = clamp(position ?? inner)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => setImage(img)
    img.src = src
    return () => {
      img.onload = null
    }
  }, [src])

  const set = (next: number) => {
    const v = Math.round(clamp(next) * 10) / 10
    if (v === pos) return
    setInner(v)
    onPositionChange?.(v)
  }

  const fromPointer = (e: PointerEvent) => {
    const r = root.current!.getBoundingClientRect()
    set(((e.clientX - r.left) / r.width) * 100)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1
    const next = {
      ArrowLeft: pos - step,
      ArrowDown: pos - step,
      ArrowRight: pos + step,
      ArrowUp: pos + step,
      PageDown: pos - 10,
      PageUp: pos + 10,
      Home: 0,
      End: 100,
    }[e.key]
    if (next === undefined) return
    e.preventDefault()
    set(next)
  }

  return (
    <div
      ref={root}
      className={cn("relative w-full cursor-ew-resize touch-pan-y overflow-hidden select-none", className)}
      style={{ aspectRatio: image ? `${image.naturalWidth} / ${image.naturalHeight}` : "1" }}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        e.currentTarget.setPointerCapture(e.pointerId)
        handle.current?.focus({ preventScroll: true })
        fromPointer(e)
      }}
      onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && fromPointer(e)}
    >
      <AsciiCanvas source={image} aria-label={`${alt}, as ASCII`} className="absolute inset-0" {...props} />
      {/* eslint-disable-next-line @next/next/no-img-element -- must be the same file the canvas samples, cropped identically */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="absolute inset-0 size-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <div
        ref={handle}
        role="slider"
        tabIndex={0}
        aria-label="Divider between photo and ASCII"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pos}
        aria-valuetext={`${Math.round(pos)}% photo`}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="group/handle absolute inset-y-0 flex w-6 -translate-x-1/2 justify-center outline-none"
        style={{ left: `${pos}%` }}
      >
        <div
          aria-hidden
          className="h-full overflow-hidden font-mono text-xs leading-[0.75] whitespace-pre-line text-white mix-blend-difference"
        >
          {"║\n".repeat(160)}
        </div>
        <div
          aria-hidden
          className="absolute top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded-full border bg-background px-1.5 py-1 font-mono text-[10px] leading-none text-foreground shadow-sm transition-shadow group-focus-visible/handle:ring-2 group-focus-visible/handle:ring-ring"
        >
          <span>◀</span>
          <span>▶</span>
        </div>
      </div>
    </div>
  )
}
