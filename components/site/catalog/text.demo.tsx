"use client"

import { useEffect, useState } from "react"

import { AsciiDissolve } from "@/components/ascii/ascii-dissolve"
import { AsciiScramble } from "@/components/ascii/ascii-scramble"
import { AsciiText } from "@/components/ascii/ascii-text"
import { Button } from "@/components/ui/button"
import { charsets } from "@/lib/ascii/charsets"

import { attr, imports, jsx, lines } from "./code"
import { inkSwatches, palette, paletteAttr, usesPalette } from "./shared"
import type { Demo } from "./types"

const fonts: Record<string, string> = {
  sans: "900 160px ui-sans-serif, system-ui, sans-serif",
  serif: "italic 700 200px Georgia, serif",
  mono: "700 160px ui-monospace, monospace",
}

const noise: Record<string, string> = {
  symbols: "!<>-_\\/[]{}=+*^?#@$%&",
  binary: "01",
  blocks: "░▒▓█▀▄▌▐",
  katakana: charsets.katakana.trim(),
}

type DissolveTrigger = "view" | "mount" | "hover"

function RedactExample() {
  const [hidden, setHidden] = useState(false)
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Customer</p>
        <Button size="sm" variant="outline" onClick={() => setHidden((h) => !h)}>
          {hidden ? "Show details" : "Hide details"}
        </Button>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Name</dt>
        <dd>
          <AsciiDissolve text="Ada Lovelace" dissolved={hidden} />
        </dd>
        <dt className="text-muted-foreground">Email</dt>
        <dd>
          <AsciiDissolve text="ada@analytical.engine" dissolved={hidden} />
        </dd>
        <dt className="text-muted-foreground">Card</dt>
        <dd className="font-mono">
          <AsciiDissolve text="•••• 1843" dissolved={hidden} />
        </dd>
      </dl>
    </div>
  )
}

function DissolveThumb() {
  const [dissolved, setDissolved] = useState(true)
  useEffect(() => {
    const id = setInterval(() => setDissolved((d) => !d), 2200)
    return () => clearInterval(id)
  }, [])
  return (
    <AsciiDissolve
      text="dust to dust"
      dissolved={dissolved}
      duration={1100}
      className="text-3xl font-semibold tracking-tight text-primary"
    />
  )
}

export const textDemos: Record<string, Demo> = {
  "ascii-text": {
    controls: [
      { prop: "text", type: "text", default: "launch", maxLength: 12 },
      { prop: "font", type: "select", options: Object.keys(fonts), default: "sans" },
      { prop: "charset", type: "select", options: ["blocks", "standard", "braille", "quadrants", "hatch", "dots"], default: "blocks" },
      { prop: "color", type: "swatch", options: inkSwatches, default: "ink" },
      { prop: "fontSize", label: "cell", type: "range", min: 4, max: 14, default: 8 },
    ],
    Preview: ({ values: v }) => (
      <div className="flex w-full flex-col items-center gap-4 px-6 py-12 text-center">
        <AsciiText
          text={(v.text as string) || " "}
          font={fonts[v.font as string]}
          charset={v.charset as string}
          color={palette(v.color)}
          fontSize={v.fontSize as number}
          className="max-w-xl text-primary"
        />
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">T-minus 3 days</p>
      </div>
    ),
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-text", "AsciiText"),
        usesPalette(v.color) && imports("@/lib/ascii", "palettes"),
        "",
        jsx("AsciiText", [
          attr("text", v.text),
          v.font !== "sans" && attr("font", fonts[v.font as string]),
          attr("charset", v.charset, "blocks"),
          paletteAttr(v.color),
          attr("fontSize", v.fontSize, 8),
          'className="text-primary"',
        ]),
      ),
    examples: {
      serif: () => (
        <div className="w-full max-w-lg p-8">
          <AsciiText text="Folio" font={fonts.serif} charset="braille" fontSize={9} className="text-foreground" />
        </div>
      ),
      "not-found": () => (
        <div className="flex flex-col items-center gap-4 p-10 text-center">
          <AsciiText text="404" className="w-72 text-primary" />
          <p className="text-sm text-muted-foreground">This page drifted off the grid.</p>
          <Button size="sm">Go home</Button>
        </div>
      ),
    },
    Thumb: () => <AsciiText text="ascii" fontSize={6} className="max-w-60 text-primary" />,
  },
  "ascii-scramble": {
    controls: [
      { prop: "text", type: "text", default: "access granted", maxLength: 28 },
      { prop: "trigger", type: "select", options: ["mount", "hover"], default: "mount" },
      { prop: "glyphs", type: "select", options: Object.keys(noise), default: "symbols" },
      { prop: "duration", type: "range", min: 200, max: 3000, step: 100, default: 900 },
    ],
    Preview: ({ values: v }) => (
      <div className="w-full max-w-md p-6 sm:p-10">
        <div className="rounded-lg border bg-card font-mono text-sm">
          <div className="flex gap-1.5 border-b px-3 py-2">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2.5 rounded-full bg-muted-foreground/30" />
            ))}
          </div>
          <div className="flex flex-col gap-1 p-4">
            <p className="text-muted-foreground">$ auth --user ada</p>
            <p className="text-muted-foreground">verifying key…</p>
            <p>
              <span className="text-muted-foreground">&gt; </span>
              <AsciiScramble
                key={`${v.text}${v.trigger}`}
                text={(v.text as string) || " "}
                trigger={v.trigger as "mount" | "hover"}
                glyphs={noise[v.glyphs as string]}
                duration={v.duration as number}
                className="cursor-default text-primary"
              />
            </p>
          </div>
        </div>
      </div>
    ),
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-scramble", "AsciiScramble"),
        "",
        jsx("AsciiScramble", [
          attr("text", v.text),
          attr("trigger", v.trigger, "mount"),
          v.glyphs !== "symbols" && attr("glyphs", noise[v.glyphs as string]),
          attr("duration", v.duration, 900),
        ]),
      ),
    examples: {
      nav: () => (
        <nav className="flex gap-6 p-10 font-mono text-sm">
          {["work", "about", "contact"].map((l) => (
            <a key={l} href={`#${l}`} className="text-muted-foreground transition-colors hover:text-foreground">
              <AsciiScramble text={l} trigger="hover" duration={400} />
            </a>
          ))}
        </nav>
      ),
    },
    Thumb: () => (
      <div className="flex flex-col items-center gap-1 font-mono">
        <AsciiScramble text="decrypting signal…" duration={2000} className="text-lg text-primary" />
        <span className="text-muted-foreground">access granted</span>
      </div>
    ),
  },
  "ascii-dissolve": {
    controls: [
      { prop: "text", type: "text", default: "Made of dust", maxLength: 24 },
      { prop: "trigger", type: "select", options: ["view", "mount", "hover"], default: "view" },
      { prop: "glyphs", type: "select", options: Object.keys(noise), default: "symbols" },
      { prop: "duration", type: "range", min: 200, max: 3000, step: 100, default: 900 },
    ],
    Preview: ({ values: v }) => (
      <div className="flex w-full flex-col items-center gap-4 px-6 py-14 text-center">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Volume 03 · Grain</p>
        <h3 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          <AsciiDissolve
            key={`${v.text}${v.trigger}`}
            text={(v.text as string) || " "}
            trigger={v.trigger as DissolveTrigger}
            glyphs={v.glyphs === "symbols" ? undefined : noise[v.glyphs as string]}
            duration={v.duration as number}
          />
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {v.trigger === "hover" ? "Hover the heading to blow it away." : "Every letter settles out of the noise on its own schedule."}
        </p>
      </div>
    ),
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-dissolve", "AsciiDissolve"),
        "",
        jsx("AsciiDissolve", [
          attr("text", v.text),
          attr("trigger", v.trigger, "view"),
          v.glyphs !== "symbols" && attr("glyphs", noise[v.glyphs as string]),
          attr("duration", v.duration, 900),
        ]),
      ),
    examples: {
      nav: () => (
        <nav className="flex gap-6 p-10 font-mono text-sm">
          {["index", "archive", "colophon"].map((l) => (
            <a key={l} href={`#${l}`} className="text-muted-foreground transition-colors hover:text-foreground">
              <AsciiDissolve text={l} trigger="hover" duration={350} />
            </a>
          ))}
        </nav>
      ),
      redact: RedactExample,
    },
    Thumb: DissolveThumb,
  },
}
