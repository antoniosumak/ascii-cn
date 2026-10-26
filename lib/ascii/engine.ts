export type DitherMode = "none" | "bayer" | "floyd"

export type ToneOptions = {
  /** Added to every tone after contrast. -1 to 1. */
  brightness?: number
  /** Multiplier around mid grey. 1 leaves tones unchanged. */
  contrast?: number
  gamma?: number
  invert?: boolean
  dither?: DitherMode
}

/**
 * One frame of ASCII. `tone` and `rgb` live on the sample grid, which is the
 * character grid for ramps, 2×4 sub-cells per character for braille and 2×2 for quadrants.
 */
export type Frame = {
  cols: number
  rows: number
  width: number
  height: number
  /** 0 is empty, 1 is full ink. */
  tone: Float32Array
  rgb: Uint8ClampedArray
  /** Per-character override as a char code. 0 picks a glyph from the charset by tone. */
  glyph: Uint16Array
}

export const BRAILLE = "braille"
export const QUADRANTS = "quadrants"

/** Samples per character as [x, y]: one for ramps, more for charsets that pack a dot grid into each cell. */
export const cellGrid = (charset: string): [number, number] =>
  charset === BRAILLE ? [2, 4] : charset === QUADRANTS ? [2, 2] : [1, 1]

export function createFrame(cols: number, rows: number, charset = ""): Frame {
  const [sx, sy] = cellGrid(charset)
  const width = cols * sx
  const height = rows * sy
  return {
    cols,
    rows,
    width,
    height,
    tone: new Float32Array(width * height),
    rgb: new Uint8ClampedArray(width * height * 3),
    glyph: new Uint16Array(cols * rows),
  }
}

// Written so NaN lands on 0; fields divide by zero at singular points.
const clamp01 = (v: number) => (v > 0 ? (v < 1 ? v : 1) : 0)

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

/** Applies tone adjustments, then quantises to `levels` with optional dithering. */
export function shapeTone(f: Frame, levels: number, o: ToneOptions = {}) {
  const { brightness = 0, contrast = 1, gamma = 1, invert = false, dither = "none" } = o
  const t = f.tone
  const w = f.width
  for (let i = 0; i < t.length; i++) {
    let v = clamp01((t[i] - 0.5) * contrast + 0.5 + brightness)
    if (gamma !== 1) v = v ** gamma
    t[i] = invert ? 1 - v : v
  }
  if (dither === "none" || levels < 2) return

  const q = levels - 1
  if (dither === "bayer") {
    for (let i = 0; i < t.length; i++) {
      const x = i % w
      const y = (i / w) | 0
      const threshold = (BAYER4[(y & 3) * 4 + (x & 3)] + 0.5) / 16
      t[i] = Math.min(q, Math.floor(t[i] * q + threshold)) / q
    }
    return
  }

  for (let i = 0; i < t.length; i++) {
    const old = t[i]
    const next = Math.round(clamp01(old) * q) / q
    const err = old - next
    t[i] = next
    const x = i % w
    const hasBelow = i + w < t.length
    if (x < w - 1) t[i + 1] += (err * 7) / 16
    if (hasBelow) {
      if (x > 0) t[i + w - 1] += (err * 3) / 16
      t[i + w] += (err * 5) / 16
      if (x < w - 1) t[i + w + 1] += err / 16
    }
  }
}

let scratch: CanvasRenderingContext2D | null = null

function scratchContext(w: number, h: number) {
  if (!scratch) {
    scratch = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!
  }
  const c = scratch.canvas
  if (c.width !== w || c.height !== h) {
    c.width = w
    c.height = h
  }
  return scratch
}

export type Fit = "cover" | "contain" | "fill"

/** Draws `source` into a w × h box at the origin of `ctx`, cropped or letterboxed by `fit`. */
export function drawFitted(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  w: number,
  h: number,
  fit: Fit = "cover",
  /** Physical width / height of the box on screen, when its pixels aren't square. */
  aspect = w / h,
  mirror = false,
) {
  let sx = 0
  let sy = 0
  let sw = sourceWidth
  let sh = sourceHeight
  let dx = 0
  let dy = 0
  let dw = w
  let dh = h
  const srcAspect = sourceWidth / sourceHeight
  if (fit === "cover") {
    if (srcAspect > aspect) {
      sw = sourceHeight * aspect
      sx = (sourceWidth - sw) / 2
    } else {
      sh = sourceWidth / aspect
      sy = (sourceHeight - sh) / 2
    }
  } else if (fit === "contain") {
    if (srcAspect > aspect) {
      dh = (h * aspect) / srcAspect
      dy = (h - dh) / 2
    } else {
      dw = (w * srcAspect) / aspect
      dx = (w - dw) / 2
    }
  }
  ctx.save()
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  if (mirror) {
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
  }
  ctx.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh)
  ctx.restore()
}

/** Downsamples an image, video or canvas into the frame. Tone is luminance: bright pixels give high tones. */
export function sampleSource(
  f: Frame,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  fit: Fit = "cover",
  /** Physical width / height of the area the frame covers on screen. */
  aspect = f.width / f.height,
  mirror = false,
) {
  const ctx = scratchContext(f.width, f.height)
  ctx.clearRect(0, 0, f.width, f.height)
  drawFitted(ctx, source, sourceWidth, sourceHeight, f.width, f.height, fit, aspect, mirror)

  const px = ctx.getImageData(0, 0, f.width, f.height).data
  for (let i = 0, j = 0; i < f.tone.length; i++, j += 4) {
    const a = px[j + 3] / 255
    f.tone[i] = ((0.2126 * px[j] + 0.7152 * px[j + 1] + 0.0722 * px[j + 2]) / 255) * a
    f.rgb[i * 3] = px[j]
    f.rgb[i * 3 + 1] = px[j + 1]
    f.rgb[i * 3 + 2] = px[j + 2]
  }
}

/** Stretches tones so the darkest and brightest 1% of samples land on 0 and 1. Flat photos gain the most. */
export function autoLevels(f: Frame) {
  const t = f.tone
  const hist = new Uint32Array(256)
  for (let i = 0; i < t.length; i++) hist[Math.min(255, (t[i] * 255) | 0)]++
  const cut = t.length * 0.01
  let lo = 0
  let hi = 255
  for (let sum = 0; lo < 255 && (sum += hist[lo]) < cut; lo++);
  for (let sum = 0; hi > 0 && (sum += hist[hi]) < cut; hi--);
  if (hi <= lo) return
  const a = lo / 255
  const span = (hi - lo) / 255
  for (let i = 0; i < t.length; i++) t[i] = clamp01((t[i] - a) / span)
}

/** Evaluates `field(x, y)` at the centre of every sample. x and y run from 0 to 1. */
export function sampleField(f: Frame, field: (x: number, y: number) => number) {
  for (let y = 0; y < f.height; y++) {
    const v = (y + 0.5) / f.height
    for (let x = 0; x < f.width; x++) {
      f.tone[y * f.width + x] = field((x + 0.5) / f.width, v)
    }
  }
}

const EDGE_GLYPHS = Array.from("|/-\\", (ch) => ch.charCodeAt(0))

/**
 * Outlines contours with | / - \ along the edge, by Sobel gradient on the tone grid.
 * `threshold` is the gradient strength to outline, 0 to 1. Run it before dithering; ramps only.
 */
export function edgeGlyphs(f: Frame, threshold: number) {
  const { tone, cols: w, rows: h } = f
  if (f.width !== w) return
  const at = (x: number, y: number) => tone[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))]
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (f.glyph[y * w + x]) continue
      const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1)
      const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1)
      if (Math.hypot(gx, gy) / 4 < threshold) continue
      // The edge runs perpendicular to the gradient; y points down, so a gradient at 45° draws "/".
      const a = Math.atan2(gy, gx)
      f.glyph[y * w + x] = EDGE_GLYPHS[Math.round((a < 0 ? a + Math.PI : a) / (Math.PI / 4)) % 4]
    }
  }
}

// Braille dot bits for sub-cell (dx, dy), indexed dy * 2 + dx.
const BRAILLE_BITS = [0x01, 0x08, 0x02, 0x10, 0x04, 0x20, 0x40, 0x80]
// Indexed by bits top-left 1, top-right 2, bottom-left 4, bottom-right 8.
const QUADRANT_GLYPHS = " ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█"

export function frameToLines(f: Frame, charset: string): string[] {
  const braille = charset === BRAILLE
  const [sx, sy] = cellGrid(charset)
  const ramp = Array.from(charset)
  const q = ramp.length - 1
  const lines: string[] = []
  for (let r = 0; r < f.rows; r++) {
    let s = ""
    for (let c = 0; c < f.cols; c++) {
      const g = f.glyph[r * f.cols + c]
      if (g) {
        s += String.fromCharCode(g)
      } else if (sx > 1) {
        let bits = 0
        for (let k = 0; k < sx * sy; k++) {
          const i = (r * sy + ((k / sx) | 0)) * f.width + c * sx + (k % sx)
          if (f.tone[i] >= 0.5) bits |= braille ? BRAILLE_BITS[k] : 1 << k
        }
        s += braille ? (bits ? String.fromCharCode(0x2800 + bits) : " ") : QUADRANT_GLYPHS[bits]
      } else {
        s += ramp[Math.round(clamp01(f.tone[r * f.cols + c]) * q)]
      }
    }
    lines.push(s)
  }
  return lines
}

export type Cell = { width: number; height: number; fontSize: number; font: string }

export function measureCell(
  ctx: CanvasRenderingContext2D,
  fontSize: number,
  fontFamily: string,
  lineHeight: number,
): Cell {
  const font = `${fontSize}px ${fontFamily}`
  ctx.font = font
  return { width: ctx.measureText("M").width, height: fontSize * lineHeight, fontSize, font }
}

/** Pre-rendered glyphs in one colour, so painting a cell is a drawImage instead of a fillText. */
export class GlyphAtlas {
  private ctx: CanvasRenderingContext2D
  private slots = new Map<string, number>()
  private readonly capacity = 512

  constructor(
    readonly cell: Cell,
    readonly color: string,
    readonly dpr: number,
  ) {
    const canvas = document.createElement("canvas")
    canvas.width = Math.ceil(cell.width * dpr) * this.capacity
    canvas.height = Math.ceil(cell.height * dpr)
    this.ctx = canvas.getContext("2d")!
  }

  get canvas() {
    return this.ctx.canvas
  }

  get slotWidth() {
    return Math.ceil(this.cell.width * this.dpr)
  }

  slot(ch: string): number {
    let i = this.slots.get(ch)
    if (i !== undefined) return i
    // ponytail: atlas resets when full, fine for ramps; a two-level cache if callers ever stream thousands of distinct glyphs
    if (this.slots.size >= this.capacity) {
      this.slots.clear()
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
    i = this.slots.size
    this.slots.set(ch, i)
    const { ctx } = this
    ctx.font = `${this.cell.fontSize * this.dpr}px ${this.cell.font.slice(this.cell.font.indexOf(" ") + 1)}`
    ctx.fillStyle = this.color
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(ch, (i + 0.5) * this.slotWidth, this.canvas.height / 2)
    return i
  }
}

export type PaintOptions = {
  cell: Cell
  /** "source" colours each glyph with its sampled pixel, an array maps tone onto gradient stops, anything else is a CSS colour. */
  color: string | readonly string[]
  atlas: GlyphAtlas | null
  /** Fade each glyph by its tone. */
  opacity?: boolean
  /** Paints under the glyphs, after the canvas is cleared. Context state is restored afterwards. */
  underlay?: (ctx: CanvasRenderingContext2D) => void
}

/** Draws lines onto a context already scaled to CSS pixels. */
export function paint(ctx: CanvasRenderingContext2D, f: Frame, lines: string[], o: PaintOptions) {
  const { cell, atlas, color } = o
  const sx = f.width / f.cols
  const sy = f.height / f.rows
  const packed = sx > 1
  const lut = typeof color === "string" ? null : gradientLUT(color)
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.restore()
  if (o.underlay) {
    ctx.save()
    o.underlay(ctx)
    ctx.restore()
  }
  ctx.font = cell.font
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  for (let r = 0; r < lines.length; r++) {
    const line = lines[r]
    const y = r * cell.height
    for (let c = 0; c < line.length; c++) {
      const ch = line[c]
      if (ch === " ") continue
      const i = r * sy * f.width + c * sx
      ctx.globalAlpha = o.opacity && !packed ? clamp01(f.tone[i]) : 1
      const x = c * cell.width
      if (typeof color !== "string") {
        ctx.fillStyle = lut![Math.round(cellTone(f, i, sx, sy) * 255)]
        ctx.fillText(ch, x + cell.width / 2, y + cell.height / 2)
      } else if (color === "source" || !atlas) {
        ctx.fillStyle = color === "source" ? `rgb(${f.rgb[i * 3]},${f.rgb[i * 3 + 1]},${f.rgb[i * 3 + 2]})` : color
        ctx.fillText(ch, x + cell.width / 2, y + cell.height / 2)
      } else {
        const sw = atlas.slotWidth
        ctx.drawImage(atlas.canvas, atlas.slot(ch) * sw, 0, sw, atlas.canvas.height, x, y, cell.width, cell.height)
      }
    }
  }
  ctx.globalAlpha = 1
}

/** Mean tone of the samples under one character, so packed charsets get in-between colours. */
function cellTone(f: Frame, i: number, sx: number, sy: number) {
  let sum = 0
  for (let dy = 0; dy < sy; dy++) for (let dx = 0; dx < sx; dx++) sum += f.tone[i + dy * f.width + dx]
  return clamp01(sum / (sx * sy))
}

let pixel: CanvasRenderingContext2D | null = null

/** Any CSS colour as [r, g, b]. */
function parseColor(color: string) {
  pixel ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true })!
  pixel.clearRect(0, 0, 1, 1)
  pixel.fillStyle = color
  pixel.fillRect(0, 0, 1, 1)
  return pixel.getImageData(0, 0, 1, 1).data
}

let lutKey = ""
let lut: string[] = []

/** 256 CSS colours interpolated across `stops`. The last palette is cached, so passing a fresh array each render is fine. */
function gradientLUT(stops: readonly string[]) {
  const key = stops.join("|")
  if (key === lutKey) return lut
  const rgb = stops.map(parseColor)
  lutKey = key
  lut = Array.from({ length: 256 }, (_, k) => {
    const p = (k / 255) * (rgb.length - 1)
    const a = rgb[Math.floor(p)]
    const b = rgb[Math.ceil(p)]
    const t = p % 1
    return `rgb(${[0, 1, 2].map((j) => Math.round(a[j] + (b[j] - a[j]) * t))})`
  })
  return lut
}

/** Relative luminance of any CSS colour, 0 to 1. */
export function luminance(color: string): number {
  const [r, g, b] = parseColor(color)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

export const toText = (lines: string[]) => lines.join("\n")

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export function toSVG(lines: string[], cell: Cell, color: string): string {
  const cols = lines[0]?.length ?? 0
  const w = cols * cell.width
  const h = lines.length * cell.height
  const family = cell.font.slice(cell.font.indexOf(" ") + 1).replace(/"/g, "'")
  const rows = lines
    .map(
      (line, r) =>
        `<text x="0" y="${(r + 0.5) * cell.height}" textLength="${w}" lengthAdjust="spacingAndGlyphs">${escapeXml(line)}</text>`,
    )
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><g fill="${color}" font-family="${family}" font-size="${cell.fontSize}" dominant-baseline="central" xml:space="preserve">${rows}</g></svg>`
}
