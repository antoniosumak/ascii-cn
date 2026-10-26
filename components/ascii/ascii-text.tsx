"use client"

import { useEffect, useState } from "react"

import { AsciiCanvas, type AsciiCanvasProps } from "@/lib/ascii"
import { cn } from "@/lib/utils"

export type AsciiTextProps = Omit<AsciiCanvasProps, "source" | "field" | "frame" | "ink"> & {
  text: string
  /** CSS font used to rasterise the letters before they are filled with glyphs. */
  font?: string
}

/** Big display type drawn out of smaller characters. Any font, no FIGlet files. */
export function AsciiText({
  text,
  font = "900 160px ui-sans-serif, system-ui, sans-serif",
  fontSize = 8,
  charset = "blocks",
  className,
  ...props
}: AsciiTextProps) {
  const [mask, setMask] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let live = true
    document.fonts.ready.then(() => {
      if (!live) return
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      ctx.font = font
      const m = ctx.measureText(text)
      const pad = m.actualBoundingBoxAscent * 0.1
      canvas.width = Math.ceil(m.width + pad * 2)
      canvas.height = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + pad * 2)
      ctx.font = font
      ctx.fillStyle = "#fff"
      ctx.textBaseline = "alphabetic"
      ctx.fillText(text, pad, pad + m.actualBoundingBoxAscent)
      setMask(canvas)
    })
    return () => {
      live = false
    }
  }, [text, font])

  return (
    <div
      className={cn("relative w-full", className)}
      style={{ aspectRatio: mask ? `${mask.width} / ${mask.height}` : "5 / 1" }}
    >
      <AsciiCanvas
        source={mask}
        ink="light"
        fit="contain"
        fontSize={fontSize}
        charset={charset}
        aria-label={text}
        className="absolute inset-0"
        {...props}
      />
    </div>
  )
}
