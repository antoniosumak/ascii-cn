"use client"

import { useEffect, useEffectEvent, useImperativeHandle, useRef, type ComponentProps, type Ref } from "react"

import { cn } from "@/lib/utils"

import { resolveCharset, type CharsetName } from "./charsets"
import {
  autoLevels,
  cellGrid,
  createFrame,
  drawFitted,
  edgeGlyphs,
  frameToLines,
  GlyphAtlas,
  luminance,
  measureCell,
  paint,
  sampleField,
  sampleSource,
  shapeTone,
  toSVG,
  toText,
  type Cell,
  type Fit,
  type Frame,
  type ToneOptions,
} from "./engine"

export type FieldState = {
  cols: number
  rows: number
  /** Physical width / height of the canvas. Multiply x by it for round shapes. */
  aspect: number
  /** Pointer position over the canvas, 0 to 1. `active` is false while it is outside. */
  mouse: { x: number; y: number; active: boolean }
}

/** Returns ink from 0 to 1 at (x, y), both 0 to 1, at time t in seconds. */
export type AsciiField = (x: number, y: number, t: number, s: FieldState) => number

/** Writes a whole frame: fill `f.tone`, and optionally `f.glyph` to force characters. */
export type AsciiFrame = (f: Frame, t: number, s: FieldState) => void

export type AsciiSource = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap

export type AsciiHandle = {
  canvas: HTMLCanvasElement | null
  text: () => string
  svg: () => string
  png: () => Promise<Blob | null>
}

export type AsciiCanvasProps = Omit<ComponentProps<"canvas">, "ref" | "children" | "color"> &
  ToneOptions & {
    ref?: Ref<AsciiHandle>
    field?: AsciiField
    frame?: AsciiFrame
    source?: AsciiSource | null
    charset?: CharsetName | (string & {})
    /** Glyph size in CSS pixels. */
    fontSize?: number
    lineHeight?: number
    /**
     * "ink" uses the canvas's CSS `color`, so `text-primary` themes it. "source" keeps the source's pixel colours.
     * An array of CSS colours is a gradient map from faint to full ink, e.g. `palettes.thermal`.
     */
    color?: "ink" | "source" | readonly string[]
    /** Fade each glyph by its tone instead of only picking a denser glyph. */
    opacity?: boolean
    /** Outline contours with | / - \ where the tone gradient beats this strength, 0 to 1. Try 0.3. Ramps only. */
    edges?: number
    /** Draw the source softly under the glyphs at this opacity, 0 to 1. Makes photos far easier to read. */
    backdrop?: number
    fit?: Fit
    /** Flip the source horizontally, e.g. for a selfie camera. */
    mirror?: boolean
    /**
     * Which source pixels become ink. "auto" picks light pixels when the ink colour
     * is light and dark pixels when it is dark, so photos look right in both themes.
     */
    ink?: "auto" | "light" | "dark"
    /** Stretch source tones to the full range before shaping. */
    normalize?: boolean
    /** Defaults to true for fields, frames and video. Off under prefers-reduced-motion except for video. */
    animate?: boolean
    fps?: number
    onRender?: (lines: string[]) => void
  }

type State = {
  w: number
  h: number
  key: string
  cell: Cell | null
  frame: Frame | null
  atlas: GlyphAtlas | null
  color: string
  darkInk: boolean
  colorDirty: boolean
  lines: string[]
  t: number
  mouse: FieldState["mouse"]
}

const sourceSize = (s: AsciiSource): [number, number] =>
  s instanceof HTMLImageElement
    ? [s.naturalWidth, s.naturalHeight]
    : s instanceof HTMLVideoElement
      ? [s.videoWidth, s.videoHeight]
      : [s.width, s.height]

export function AsciiCanvas({
  ref,
  field,
  frame,
  source,
  charset = "standard",
  fontSize = 12,
  lineHeight = 1,
  color = "ink",
  opacity = false,
  edges = 0,
  backdrop = 0,
  fit = "cover",
  mirror = false,
  ink = "auto",
  normalize = true,
  animate,
  fps = 30,
  brightness,
  contrast,
  gamma,
  invert,
  dither,
  onRender,
  className,
  ...props
}: AsciiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const st = useRef<State>({
    w: 0,
    h: 0,
    key: "",
    cell: null,
    frame: null,
    atlas: null,
    color: "",
    darkInk: false,
    colorDirty: true,
    lines: [],
    t: 0,
    mouse: { x: 0.5, y: 0.5, active: false },
  })

  const isVideo = typeof HTMLVideoElement !== "undefined" && source instanceof HTMLVideoElement

  const draw = useEffectEvent(() => {
    const canvas = canvasRef.current
    const s = st.current
    if (!canvas || !s.w || !s.h) return
    const ctx = canvas.getContext("2d")!
    const ramp = resolveCharset(charset)
    const packed = cellGrid(ramp)[0] > 1
    const dpr = window.devicePixelRatio || 1
    const styles = getComputedStyle(canvas)

    const key = `${s.w}x${s.h}@${dpr}|${fontSize}/${lineHeight}|${styles.fontFamily}|${cellGrid(ramp)}`
    if (key !== s.key) {
      s.key = key
      canvas.width = Math.round(s.w * dpr)
      canvas.height = Math.round(s.h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      s.cell = measureCell(ctx, fontSize, styles.fontFamily, lineHeight)
      const cols = Math.max(1, Math.floor(s.w / s.cell.width))
      const rows = Math.max(1, Math.floor(s.h / s.cell.height))
      s.frame = createFrame(cols, rows, ramp)
      s.colorDirty = true
    }
    if (s.colorDirty) {
      s.colorDirty = false
      s.color = styles.color
      s.darkInk = luminance(s.color) < 0.5
      s.atlas = new GlyphAtlas(s.cell!, s.color, dpr)
    }

    const f = s.frame!
    const state: FieldState = { cols: f.cols, rows: f.rows, aspect: s.w / s.h, mouse: s.mouse }
    let flip = false
    let underlay: ((ctx: CanvasRenderingContext2D) => void) | undefined
    f.glyph.fill(0)
    if (source) {
      const [sw, sh] = sourceSize(source)
      if (!sw || !sh) return
      sampleSource(f, source, sw, sh, fit, s.w / s.h, mirror)
      if (backdrop > 0) {
        const w = f.cols * s.cell!.width
        const h = f.rows * s.cell!.height
        underlay = (ctx) => {
          ctx.globalAlpha = backdrop
          drawFitted(ctx, source, sw, sh, w, h, fit, s.w / s.h, mirror)
        }
      }
      if (normalize) autoLevels(f)
      flip = ink === "dark" || (ink === "auto" && s.darkInk)
    } else if (frame) {
      f.tone.fill(0)
      frame(f, s.t, state)
    } else if (field) {
      sampleField(f, (x, y) => field(x, y, s.t, state))
    }

    if (edges > 0) edgeGlyphs(f, edges)
    const levels = packed ? 2 : Array.from(ramp).length
    shapeTone(f, levels, { brightness, contrast, gamma, dither, invert: flip !== !!invert })
    s.lines = frameToLines(f, ramp)
    paint(ctx, f, s.lines, { cell: s.cell!, color: color === "ink" ? s.color : color, atlas: s.atlas, opacity, underlay })
    onRender?.(s.lines)
  })

  const shouldAnimate = useEffectEvent((reduced: boolean) => {
    if (isVideo) return animate ?? true
    return (animate ?? !!(field || frame)) && !reduced
  })

  // Props change on every render; one redraw per render keeps static output in sync.
  useEffect(() => {
    st.current.colorDirty = true
    draw()
  })

  useEffect(() => {
    const canvas = canvasRef.current!
    const s = st.current
    const reduce = matchMedia("(prefers-reduced-motion: reduce)")
    let visible = true
    let raf = 0
    let last = 0
    let start = performance.now()

    const ro = new ResizeObserver(([e]) => {
      s.w = e.contentRect.width
      s.h = e.contentRect.height
      draw()
    })
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    const mo = new MutationObserver(() => {
      s.colorDirty = true
      draw()
    })
    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      s.mouse.x = (e.clientX - r.left) / r.width
      s.mouse.y = (e.clientY - r.top) / r.height
      s.mouse.active = s.mouse.x >= 0 && s.mouse.x <= 1 && s.mouse.y >= 0 && s.mouse.y <= 1
    }
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible || document.hidden || !shouldAnimate(reduce.matches)) {
        start = now - s.t * 1000
        return
      }
      if (now - last < 1000 / fps) return
      last = now
      s.t = (now - start) / 1000
      draw()
    }

    ro.observe(canvas)
    io.observe(canvas)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
    window.addEventListener("pointermove", onPointer, { passive: true })
    document.fonts?.ready.then(() => {
      s.key = ""
      draw()
    })
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      window.removeEventListener("pointermove", onPointer)
    }
  }, [fps])

  useImperativeHandle(ref, () => ({
    get canvas() {
      return canvasRef.current
    },
    text: () => toText(st.current.lines),
    svg: () => (st.current.cell ? toSVG(st.current.lines, st.current.cell, st.current.color) : ""),
    png: () => new Promise((resolve) => (canvasRef.current ? canvasRef.current.toBlob(resolve) : resolve(null))),
  }))

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="ASCII art"
      className={cn("block size-full font-mono", className)}
      {...props}
    />
  )
}
