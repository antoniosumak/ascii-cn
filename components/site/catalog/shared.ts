import { palettes } from "@/lib/ascii/charsets"

import type { Meta, Prop, Value } from "./types"

export const canvasProps: Prop[] = [
  ["charset", "CharsetName | string", '"standard"', "Named ramp or your own string, empty to dense. \"braille\" packs 2×4 dots per cell, \"quadrants\" 2×2 blocks."],
  ["fontSize", "number", "12", "Cell size in CSS pixels. Smaller means more detail."],
  ["dither", '"none" | "bayer" | "floyd"', '"none"', "Quantisation. Floyd–Steinberg for photos, Bayer for a retro look."],
  ["color", '"ink" | "source" | string[]', '"ink"', "Ink uses the CSS colour (theme with text-*). Source keeps pixel colours. An array maps tone onto gradient stops, e.g. palettes.thermal."],
  ["edges", "number", "0", "Outline contours with | / - \\ where the tone gradient beats this strength. Try 0.3. Ramps only."],
  ["opacity", "boolean", "false", "Fade each glyph by its tone."],
  ["brightness", "number", "0", "Added after contrast, -1 to 1."],
  ["contrast", "number", "1", "Multiplier around mid grey."],
  ["gamma", "number", "1", "Tone curve exponent."],
  ["invert", "boolean", "false", "Swap ink and blank."],
  ["animate", "boolean", "auto", "On for fields, frames and video. Off under reduced motion, except video."],
  ["fps", "number", "30", "Frame cap."],
  ["ref", "Ref<AsciiHandle>", "—", "Exposes text(), svg(), png() and the canvas."],
]

/** Notes every canvas-based component shares. Pass an accessibility line, since that one differs. */
export const canvasNotes = (accessibility: string): NonNullable<Meta["notes"]> => [
  ["Accessibility", accessibility],
  ["Motion", "Animation pauses offscreen and in hidden tabs. Under `prefers-reduced-motion` it freezes on the current frame."],
  ["Theming", "Glyphs take the CSS `color`, so `text-primary` or `text-foreground/40` themes them. Theme changes repaint at once."],
  ["Performance", "Glyphs are stamped from a pre-rendered atlas onto one canvas, capped at 30 fps. Export with `ref.current.text()`, `svg()` or `png()`."],
]

/** Colour palettes offered by swatch controls, mapped to a CSS preview. */
export const inkSwatches: Record<string, string> = {
  ink: "var(--primary)",
  ...Object.fromEntries(Object.entries(palettes).map(([k, stops]) => [k, `linear-gradient(90deg,${stops.join(",")})`])),
}

/** Ink swatches plus "source", for components that sample a photo. */
export const sourceSwatches = { ...inkSwatches, source: "conic-gradient(#f87171,#facc15,#4ade80,#38bdf8,#a78bfa,#f87171)" }

export const palette = (name: Value): "ink" | "source" | readonly string[] =>
  name === "ink" || name === "source" ? name : palettes[name as keyof typeof palettes]
export const paletteAttr = (name: Value) =>
  name === "ink" ? null : name === "source" ? 'color="source"' : `color={palettes.${name}}`
/** True when the snippet needs `import { palettes }`. */
export const usesPalette = (name: Value) => name !== "ink" && name !== "source"
