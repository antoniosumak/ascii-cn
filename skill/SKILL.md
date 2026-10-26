---
name: asciicn
description: Build ASCII-art React components on the asciicn engine in lib/ascii. Use when the user asks for an ASCII effect, ASCII background, image or video to ASCII, terminal-style UI, text art, or anything rendered as characters.
---

# asciicn

The engine lives in `lib/ascii/` as plain source. Read it before writing code; it is short.

- `charsets.ts` — named ramps, empty to full ink. `"braille"` and `"quadrants"` are special: 2×4 dots or 2×2 blocks per cell. Also exports `palettes`.
- `engine.ts` — `Frame`, sampling, `shapeTone` (contrast, gamma, invert, Bayer or Floyd–Steinberg dither), `frameToLines`, `paint`, `toText`, `toSVG`.
- `ascii-canvas.tsx` — `<AsciiCanvas>`, the React primitive every component builds on.

## Pick the input

`<AsciiCanvas>` takes exactly one of:

| Prop | Use for | Signature |
| --- | --- | --- |
| `source` | photos, video, another canvas | `HTMLImageElement \| HTMLVideoElement \| HTMLCanvasElement \| ImageBitmap` |
| `field` | backgrounds, anything per-cell and stateless | `(x, y, t, s) => ink` with x, y in 0..1, t in seconds |
| `frame` | simulations, 3D, particles, forced glyphs | `(f, t, s) => void`, write `f.tone` (and `f.glyph` char codes to force a character) |

`s` is `{ cols, rows, aspect, mouse: { x, y, active } }`. Multiply x by `s.aspect` for round shapes.
`f.tone` is indexed on the sample grid `f.width × f.height`, which is the character grid except for braille and quadrants (see `cellGrid`).

Ink is 0 (blank) to 1 (densest glyph). For `source`, light pixels become ink on a light ink colour and dark pixels on a dark one (`ink="auto"`); pass `ink="light"` for masks such as rasterised text.

## Style

- Colour comes from CSS `color` on the canvas: theme it with `className="text-primary"` or `text-muted-foreground`. Never hard-code hex.
- `color="source"` keeps photo colours; `color={palettes.thermal}` (or any array of stops) gradient-maps tone.
- `edges={0.3}` outlines contours with `| / - \` on ramp charsets.
- `opacity` fades glyphs by tone; use it for backgrounds.
- `fontSize` (default 12) sets the cell size; smaller means more detail.
- `dither="floyd"` for photos, `"bayer"` for a retro ordered look.
- Decorative canvases get `aria-hidden role="presentation"`; meaningful ones get an `aria-label`.

## Rules

- The canvas fills its parent. Give the parent a size or an `aspect-ratio`.
- Animation pauses offscreen and under `prefers-reduced-motion` (video keeps playing). Do not add your own rAF loop.
- Keep per-frame work allocation-free where you can; a full-screen grid is ~20k cells at 30 fps.
- Need text or SVG out? Pass a `ref`: `ref.current.text()`, `.svg()`, `.png()`.

## Example: a custom field

```tsx
"use client"
import { AsciiCanvas } from "@/lib/ascii"

export function Orbit() {
  return (
    <div className="h-64">
      <AsciiCanvas
        aria-hidden
        opacity
        className="text-primary"
        field={(x, y, t, s) => {
          const dx = (x - 0.5 - 0.25 * Math.cos(t)) * s.aspect
          const dy = y - 0.5 - 0.25 * Math.sin(t)
          return Math.max(0, 1 - Math.hypot(dx, dy) * 4)
        }}
      />
    </div>
  )
}
```

Ready-made examples (`ascii-background`, `ascii-donut`, `ascii-matrix`, …) install with `npx shadcn add @asciicn/<name>`. Read their source for technique before writing similar effects from scratch.
