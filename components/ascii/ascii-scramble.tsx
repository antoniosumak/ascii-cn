"use client"

import { useEffect, useEffectEvent, useRef, useState, type ComponentProps } from "react"

export type AsciiScrambleProps = Omit<ComponentProps<"span">, "children"> & {
  text: string
  /** Glyphs shown while a letter is still decoding. */
  glyphs?: string
  /** Milliseconds for the whole text to settle. */
  duration?: number
  /** "mount" decodes once on mount, "hover" again on every pointer enter. */
  trigger?: "mount" | "hover"
}

export function AsciiScramble({
  text,
  glyphs = "!<>-_\\/[]{}=+*^?#@$%&",
  duration = 900,
  trigger = "mount",
  onPointerEnter,
  ...props
}: AsciiScrambleProps) {
  const [scrambled, setScrambled] = useState<string | null>(null)
  const raf = useRef(0)

  const run = () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    cancelAnimationFrame(raf.current)
    const start = performance.now()
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const settled = Math.floor(p * text.length)
      let out = text.slice(0, settled)
      for (let i = settled; i < text.length; i++) {
        out += text[i] === " " ? " " : glyphs[Math.floor(Math.random() * glyphs.length)]
      }
      setScrambled(p < 1 ? out : null)
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }

  const runOnMount = useEffectEvent(() => trigger === "mount" && run())

  useEffect(() => {
    runOnMount()
    return () => cancelAnimationFrame(raf.current)
  }, [text])

  return (
    <span
      onPointerEnter={(e) => {
        if (trigger === "hover") run()
        onPointerEnter?.(e)
      }}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden className="font-mono">
        {scrambled ?? text}
      </span>
    </span>
  )
}
