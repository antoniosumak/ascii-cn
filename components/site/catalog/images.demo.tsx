"use client"

import { useState } from "react"

import { AsciiImage } from "@/components/ascii/ascii-image"
import { AsciiImageCompare } from "@/components/ascii/ascii-image-compare"
import { AsciiMarquee } from "@/components/ascii/ascii-marquee"
import { progressBar } from "@/components/ascii/ascii-progress"
import { AsciiScrollReveal } from "@/components/ascii/ascii-scroll-reveal"
import { AsciiVideo } from "@/components/ascii/ascii-video"
import { Button } from "@/components/ui/button"
import { palettes } from "@/lib/ascii/charsets"
import type { DitherMode } from "@/lib/ascii/engine"

import { attr, imports, jsx, lines } from "./code"
import { inkSwatches, palette, paletteAttr, sourceSwatches, usesPalette } from "./shared"
import type { Control, Demo, Values } from "./types"

const photos: Record<string, { src: string; alt: string }> = {
  meadow: { src: "/demo/meadow.jpg", alt: "A painted meadow with a road leading to snowy mountains" },
  cabin: { src: "/demo/cabin.jpg", alt: "A red-roofed cabin by a lake below a snowy peak" },
  arcade: { src: "/demo/arcade.jpg", alt: "A blue halftone arcade with statues looking out to sea" },
  garden: { src: "/demo/garden.jpg", alt: "Marble columns among orange and pink flowers under a stormy sky" },
}

const toneControls = (dither = "none"): Control[] => [
  { prop: "charset", type: "select", options: ["standard", "detailed", "blocks", "braille", "quadrants", "hatch"], default: "standard" },
  { prop: "dither", type: "select", options: ["none", "bayer", "floyd"], default: dither, base: "none" },
  { prop: "color", type: "swatch", options: sourceSwatches, default: "source", base: "ink" },
  { prop: "fontSize", label: "cell", type: "range", min: 4, max: 14, default: 7, base: 12 },
]

const toneProps = (v: Values) => ({
  charset: v.charset as string,
  dither: v.dither as DitherMode,
  color: palette(v.color),
  fontSize: v.fontSize as number,
})

const toneAttrs = (v: Values) => [
  attr("charset", v.charset, "standard"),
  attr("dither", v.dither, "none"),
  paletteAttr(v.color),
  attr("fontSize", v.fontSize, 12),
]

function VideoPreview({ values }: { values: Values }) {
  const [on, setOn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="flex w-full flex-col items-center gap-3 p-6">
      {on ? (
        <AsciiVideo
          src="webcam"
          {...toneProps(values)}
          className="max-w-xl text-primary"
          aria-label="Your camera as ASCII"
          onError={(e) => {
            setError(e instanceof Error ? e.message : "Couldn't start the camera.")
            setOn(false)
          }}
        />
      ) : (
        <div className="grid aspect-video w-full max-w-xl place-items-center rounded-lg border border-dashed">
          <div className="flex flex-col items-center gap-3 text-center">
            <Button onClick={() => (setError(null), setOn(true))}>Start camera</Button>
            <p className="max-w-xs text-xs text-muted-foreground">Frames stay in your browser. Nothing is uploaded.</p>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>
      )}
      {on && (
        <Button variant="outline" size="sm" onClick={() => setOn(false)}>
          Stop camera
        </Button>
      )}
    </div>
  )
}

function CompareControlled() {
  const [position, setPosition] = useState(50)
  return (
    <div className="flex w-full max-w-xs flex-col gap-3 p-6">
      <AsciiImageCompare
        src={photos.cabin.src}
        alt={photos.cabin.alt}
        position={position}
        onPositionChange={setPosition}
        charset="blocks"
        className="rounded-lg text-primary"
      />
      <div className="flex items-center gap-1.5">
        {[
          ["ASCII", 0],
          ["Split", 50],
          ["Photo", 100],
        ].map(([label, p]) => (
          <Button key={label} size="sm" variant={position === p ? "secondary" : "ghost"} onClick={() => setPosition(p as number)}>
            {label}
          </Button>
        ))}
        <span className="ml-auto font-mono text-xs text-muted-foreground tabular-nums">{Math.round(position)}%</span>
      </div>
    </div>
  )
}

function RevealPreview({ values: v }: { values: Values }) {
  const [progress, setProgress] = useState(0)
  const photo = photos[v.src as string]
  return (
    <div className="relative h-[30rem] w-full">
      <div className="size-full overflow-y-auto">
        <article className="mx-auto flex max-w-sm flex-col gap-4 px-6 py-10 text-sm leading-relaxed text-muted-foreground">
          <p className="font-mono text-xs tracking-widest uppercase">Field notes · 04</p>
          <h3 className="text-2xl font-semibold tracking-tight text-balance text-foreground">Pictures at low resolution</h3>
          <p>
            Squint at a photo and it falls apart into blocks of light and shadow. Set those blocks in type and you get
            something between a print and a puzzle.
          </p>
          <p>Scroll down. The picture below starts as a handful of big glyphs and sharpens as it reaches the middle.</p>
          <p className="py-16 text-center font-mono text-xs">scroll ↓</p>
          <figure className="flex flex-col gap-2">
            <AsciiScrollReveal
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              from={v.from as number}
              to={v.to as number}
              reveal={v.reveal as "photo" | "ascii"}
              charset={v.charset as string}
              color={palette(v.color)}
              onProgress={setProgress}
              className="rounded-lg bg-background text-primary"
            />
            <figcaption className="font-mono text-xs">fig. 1 — {v.src as string}.jpg</figcaption>
          </figure>
          <p>
            Every step down in cell size quadruples the number of characters, so the image resolves quickly at first and
            then settles in the details: a ridge, a petal, a reflection.
          </p>
          <p>
            Keep scrolling and it stays sharp. Scroll back up and it coarsens again, so the effect is tied to the
            position, not to a timer.
          </p>
          <p className="pb-40">End of notes.</p>
        </article>
      </div>
      <p
        aria-hidden
        className="pointer-events-none absolute right-3 bottom-3 rounded-md border bg-background/90 px-2 py-1 font-mono text-[11px] whitespace-pre text-muted-foreground tabular-nums"
      >
        {progressBar(progress, 10)} {String(Math.round(progress * 100)).padStart(3)}%
      </p>
    </div>
  )
}

const logos = ["acme", "northwind", "lumen", "orbital", "parallax", "quanta"]
const itemsAttr = (items: string[]) => `items={[${items.map((i) => `"${i}"`).join(", ")}]}`

export const imagesDemos: Record<string, Demo> = {
  "ascii-image": {
    controls: [
      { prop: "src", label: "photo", type: "select", options: Object.keys(photos), default: "meadow" },
      ...toneControls(),
      { prop: "backdrop", type: "range", min: 0, max: 0.8, step: 0.05, default: 0, base: 0 },
      { prop: "edges", type: "range", min: 0, max: 1, step: 0.05, default: 0, base: 0 },
      { prop: "reveal", label: "reveal on hover", type: "boolean", default: true, base: false },
    ],
    Preview: ({ values: v }) => {
      const photo = photos[v.src as string]
      return (
        <div className="flex w-full justify-center p-6 sm:p-10">
          <figure className="w-full max-w-xs overflow-hidden rounded-xl border bg-card">
            <AsciiImage
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              {...toneProps(v)}
              backdrop={v.backdrop as number}
              edges={v.edges as number}
              reveal={v.reveal as boolean}
              className="text-primary"
            />
            <figcaption className="flex items-center justify-between border-t px-4 py-3 text-sm">
              <span className="text-foreground">{v.src as string}.jpg</span>
              <span className="font-mono text-xs text-muted-foreground">{v.reveal ? "hover me" : "ascii"}</span>
            </figcaption>
          </figure>
        </div>
      )
    },
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-image", "AsciiImage"),
        usesPalette(v.color) && imports("@/lib/ascii", "palettes"),
        "",
        jsx("AsciiImage", [
          attr("src", photos[v.src as string].src),
          attr("alt", photos[v.src as string].alt),
          ...toneAttrs(v),
          attr("backdrop", v.backdrop, 0),
          attr("edges", v.edges, 0),
          attr("reveal", v.reveal, false),
        ]),
      ),
    examples: {
      thermal: () => (
        <div className="w-full max-w-xs p-6">
          <AsciiImage src={photos.cabin.src} alt={photos.cabin.alt} edges={0.3} color={palettes.thermal} fontSize={7} />
        </div>
      ),
    },
    Thumb: () => (
      <AsciiImage src={photos.cabin.src} alt={photos.cabin.alt} fontSize={6} color="source" className="max-w-48" />
    ),
  },
  "ascii-video": {
    controls: toneControls("bayer"),
    Preview: VideoPreview,
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-video", "AsciiVideo"),
        usesPalette(v.color) && imports("@/lib/ascii", "palettes"),
        "",
        jsx("AsciiVideo", ['src="webcam"', 'aria-label="Your camera"', ...toneAttrs(v)]),
      ),
    Thumb: () => (
      <AsciiImage src={photos.garden.src} alt={photos.garden.alt} charset="blocks" dither="bayer" fontSize={6} className="max-w-48 text-primary" />
    ),
  },
  "ascii-image-compare": {
    controls: [
      { prop: "src", label: "photo", type: "select", options: Object.keys(photos), default: "cabin" },
      ...toneControls("floyd").map((c) => (c.prop === "color" ? ({ ...c, default: "ink" } as Control) : c)),
    ],
    Preview: ({ values: v }) => {
      const photo = photos[v.src as string]
      return (
        <div className="flex w-full justify-center p-4 sm:p-10">
          <div className="grid w-full max-w-2xl overflow-hidden rounded-xl border bg-background sm:grid-cols-[1fr_1.15fr]">
            <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Before / after</p>
              <h3 className="text-xl font-semibold tracking-tight text-balance">Every photo, set in type</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Drag the divider, or focus it and use the arrow keys. The glyphs are drawn live from the same file.
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {v.charset as string} · {v.dither as string} · {v.fontSize as number}px
              </p>
            </div>
            <div className="relative">
              <AsciiImageCompare key={photo.src} src={photo.src} alt={photo.alt} {...toneProps(v)} className="text-primary" />
              <span className="pointer-events-none absolute top-3 left-3 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                photo
              </span>
              <span className="pointer-events-none absolute top-3 right-3 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                ascii
              </span>
            </div>
          </div>
        </div>
      )
    },
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-image-compare", "AsciiImageCompare"),
        usesPalette(v.color) && imports("@/lib/ascii", "palettes"),
        "",
        jsx("AsciiImageCompare", [
          attr("src", photos[v.src as string].src),
          attr("alt", photos[v.src as string].alt),
          ...toneAttrs(v),
          'className="text-primary"',
        ]),
      ),
    examples: {
      controlled: CompareControlled,
    },
    Thumb: () => (
      <AsciiImageCompare src={photos.cabin.src} alt={photos.cabin.alt} charset="blocks" fontSize={6} className="w-36 rounded-md text-primary" />
    ),
  },
  "ascii-scroll-reveal": {
    controls: [
      { prop: "src", label: "photo", type: "select", options: Object.keys(photos), default: "meadow" },
      { prop: "from", type: "range", min: 16, max: 48, default: 32 },
      { prop: "to", type: "range", min: 4, max: 12, default: 6 },
      { prop: "reveal", type: "select", options: ["photo", "ascii"], default: "photo" },
      { prop: "charset", type: "select", options: ["standard", "detailed", "blocks", "braille", "hatch"], default: "standard" },
      { prop: "color", type: "swatch", options: sourceSwatches, default: "ink" },
    ],
    Preview: RevealPreview,
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-scroll-reveal", "AsciiScrollReveal"),
        usesPalette(v.color) && imports("@/lib/ascii", "palettes"),
        "",
        jsx("AsciiScrollReveal", [
          attr("src", photos[v.src as string].src),
          attr("alt", photos[v.src as string].alt),
          attr("from", v.from, 32),
          attr("to", v.to, 6),
          attr("reveal", v.reveal, "photo"),
          attr("charset", v.charset, "standard"),
          paletteAttr(v.color),
          'className="text-primary"',
        ]),
      ),
    examples: {
      ascii: () => (
        <div className="h-72 w-full overflow-y-auto">
          <div className="mx-auto flex max-w-xs flex-col gap-3 px-6 pt-60 pb-40">
            <p className="text-center font-mono text-xs text-muted-foreground">scroll ↓</p>
            <AsciiScrollReveal
              src={photos.garden.src}
              alt={photos.garden.alt}
              reveal="ascii"
              charset="braille"
              from={24}
              to={5}
              color={palettes.cyanotype}
              className="rounded-lg"
            />
          </div>
        </div>
      ),
    },
    Thumb: () => (
      <div className="flex items-center gap-2" aria-hidden>
        {[16, 9, 4].map((size, i) => (
          <AsciiImage
            key={size}
            src={photos.meadow.src}
            alt=""
            fontSize={size}
            backdrop={i === 2 ? 0.6 : 0}
            className="w-20 rounded-md text-primary"
          />
        ))}
      </div>
    ),
  },
  "ascii-marquee": {
    controls: [
      { prop: "speed", type: "range", min: 10, max: 120, step: 5, default: 40 },
      { prop: "direction", type: "select", options: ["left", "right"], default: "left" },
      { prop: "charset", type: "select", options: ["braille", "blocks", "quadrants", "standard", "hatch"], default: "braille" },
      { prop: "color", type: "swatch", options: inkSwatches, default: "ink" },
      { prop: "fontSize", label: "cell", type: "range", min: 2, max: 8, default: 4 },
      { prop: "fade", type: "range", min: 0, max: 160, step: 8, default: 64 },
    ],
    Preview: ({ values: v }) => (
      <section className="flex w-full flex-col items-center gap-6 py-14">
        <p className="text-sm text-muted-foreground">Trusted by teams at</p>
        <AsciiMarquee
          items={logos}
          speed={v.speed as number}
          direction={v.direction as "left" | "right"}
          charset={v.charset as string}
          color={palette(v.color)}
          fontSize={v.fontSize as number}
          fade={v.fade as number}
          className="w-full max-w-3xl text-muted-foreground"
        />
      </section>
    ),
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-marquee", "AsciiMarquee"),
        usesPalette(v.color) && imports("@/lib/ascii", "palettes"),
        "",
        jsx("AsciiMarquee", [
          itemsAttr(logos),
          attr("speed", v.speed, 40),
          attr("direction", v.direction, "left"),
          attr("charset", v.charset, "braille"),
          paletteAttr(v.color),
          attr("fontSize", v.fontSize, 4),
          attr("fade", v.fade, 64),
          'className="text-muted-foreground"',
        ]),
      ),
    examples: {
      rows: () => (
        <div className="flex w-full flex-col gap-4 py-8">
          <AsciiMarquee items={["design", "build", "ship"]} size={72} fontSize={6} className="text-primary" />
          <AsciiMarquee
            items={["iterate", "measure", "learn"]}
            direction="right"
            size={72}
            fontSize={6}
            className="text-muted-foreground"
          />
        </div>
      ),
      children: () => (
        <div className="w-full py-8">
          <AsciiMarquee gap={16} speed={24}>
            {Object.entries(photos).map(([name, photo]) => (
              <AsciiImage key={name} src={photo.src} alt={photo.alt} fontSize={6} className="w-36 rounded-md text-primary" />
            ))}
          </AsciiMarquee>
        </div>
      ),
    },
    Thumb: () => <AsciiMarquee items={logos} size={28} gap={28} fade={32} className="text-foreground/70" />,
  },
}
