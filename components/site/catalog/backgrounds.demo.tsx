"use client"

import { AsciiBackground, backgrounds } from "@/components/ascii/ascii-background"
import { AsciiDonut } from "@/components/ascii/ascii-donut"
import { AsciiGlobe } from "@/components/ascii/ascii-globe"
import { AsciiMatrix } from "@/components/ascii/ascii-matrix"
import { AsciiScramble } from "@/components/ascii/ascii-scramble"
import { Button } from "@/components/ui/button"
import { charsets, palettes } from "@/lib/ascii/charsets"

import { attr, imports, jsx, lines } from "./code"
import { palette, inkSwatches, paletteAttr, usesPalette } from "./shared"
import type { Demo } from "./types"

type Variant = keyof typeof backgrounds

const glyphSets: Record<string, string> = {
  katakana: charsets.katakana.trim() + "0123456789",
  binary: "01",
  hex: "0123456789ABCDEF",
}

export const backgroundsDemos: Record<string, Demo> = {
  "ascii-background": {
    controls: [
      { prop: "variant", type: "select", options: Object.keys(backgrounds), default: "topography", base: "plasma" },
      { prop: "color", type: "swatch", options: inkSwatches, default: "ink" },
      { prop: "speed", type: "range", min: 0, max: 3, step: 0.1, default: 1 },
      { prop: "fontSize", label: "cell", type: "range", min: 8, max: 20, default: 12 },
      { prop: "opacity", type: "boolean", default: true },
    ],
    Preview: ({ values: v }) => (
      <div className="relative isolate grid h-96 w-full place-items-center overflow-hidden">
        <AsciiBackground
          variant={v.variant as Variant}
          speed={v.speed as number}
          fontSize={v.fontSize as number}
          opacity={v.opacity as boolean}
          color={palette(v.color)}
          className="absolute inset-0 -z-10 text-primary/60"
        />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--background)_15%,transparent_70%)]" />
        <div className="flex max-w-sm flex-col items-center gap-3 px-6 text-center">
          <span className="rounded-full border bg-background/60 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground backdrop-blur">
            v2.0 is out
          </span>
          <h3 className="text-3xl font-semibold tracking-tight text-balance text-foreground">Ship it in characters</h3>
          <p className="text-sm text-muted-foreground">A full-bleed field behind your hero, themed by one class.</p>
          <Button size="sm">Get started</Button>
        </div>
      </div>
    ),
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-background", "AsciiBackground"),
        usesPalette(v.color) && imports("@/lib/ascii", "palettes"),
        "",
        jsx(
          "section",
          ['className="relative isolate"'],
          jsx("AsciiBackground", [
            attr("variant", v.variant, "plasma"),
            paletteAttr(v.color),
            attr("speed", v.speed, 1),
            attr("fontSize", v.fontSize, 12),
            attr("opacity", v.opacity, true),
            'className="absolute inset-0 -z-10 text-primary/60"',
          ]) + "\n<h1>Ship it in characters</h1>",
        ),
      ),
    examples: {
      ripple: () => (
        <div className="relative h-64 w-full">
          <AsciiBackground variant="ripple" className="absolute inset-0 text-primary" />
          <p className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-xs text-muted-foreground">
            move your pointer here
          </p>
        </div>
      ),
      card: () => (
        <div className="p-8">
          <div className="relative isolate w-64 overflow-hidden rounded-xl border bg-card p-6">
            <AsciiBackground
              variant="clouds"
              fontSize={10}
              className="absolute inset-0 -z-10 text-primary/30 [mask-image:linear-gradient(to_bottom,black,transparent)]"
            />
            <h3 className="font-mono text-sm text-muted-foreground">Pro</h3>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              $12<span className="text-sm font-normal text-muted-foreground"> / month</span>
            </p>
            <Button size="sm" className="mt-6 w-full">
              Upgrade
            </Button>
          </div>
        </div>
      ),
      grid: () => (
        <section className="relative isolate h-80 w-full overflow-hidden bg-zinc-950">
          <AsciiBackground variant="grid" color={palettes.sunset} className="absolute inset-0 -z-10" />
          <h2 className="pt-14 text-center font-mono text-2xl font-bold tracking-[0.3em] text-white sm:text-4xl">NIGHT DRIVE</h2>
        </section>
      ),
    },
    Thumb: () => <AsciiBackground variant="topography" fontSize={10} className="text-primary" />,
  },
  "ascii-matrix": {
    controls: [
      { prop: "glyphs", type: "select", options: Object.keys(glyphSets), default: "katakana" },
      { prop: "speed", type: "range", min: 4, max: 30, default: 14 },
      { prop: "density", type: "range", min: 0.1, max: 1, step: 0.05, default: 0.7 },
      { prop: "fontSize", label: "cell", type: "range", min: 8, max: 20, default: 12 },
    ],
    Preview: ({ values: v }) => (
      <div className="relative isolate grid h-96 w-full place-items-center overflow-hidden">
        <AsciiMatrix
          glyphs={glyphSets[v.glyphs as string]}
          speed={v.speed as number}
          density={v.density as number}
          fontSize={v.fontSize as number}
          className="absolute inset-0 -z-10 text-primary"
        />
        <div className="rounded-lg border bg-background/85 px-5 py-4 font-mono text-sm shadow-lg backdrop-blur">
          <p className="text-muted-foreground">$ ssh neo@zion</p>
          <AsciiScramble text="wake up, neo…" duration={1400} className="text-primary" />
        </div>
      </div>
    ),
    code: (v) =>
      `${imports("@/components/ascii/ascii-matrix", "AsciiMatrix")}\n\n` +
      jsx(
        "div",
        ['className="relative h-96"'],
        jsx("AsciiMatrix", [
          v.glyphs !== "katakana" && attr("glyphs", glyphSets[v.glyphs as string]),
          attr("speed", v.speed, 14),
          attr("density", v.density, 0.7),
          attr("fontSize", v.fontSize, 12),
          'className="absolute inset-0 text-primary"',
        ]),
      ),
    examples: {
      binary: () => (
        <div className="h-64 w-full">
          <AsciiMatrix glyphs="01" color={palettes.matrix} density={0.5} />
        </div>
      ),
    },
    Thumb: () => <AsciiMatrix fontSize={10} className="text-primary" />,
  },
  "ascii-donut": {
    controls: [
      { prop: "charset", type: "select", options: ["donut", "standard", "blocks", "dots", "braille"], default: "donut" },
      { prop: "color", type: "swatch", options: inkSwatches, default: "ink" },
      { prop: "speed", type: "range", min: 0, max: 3, step: 0.1, default: 1 },
      { prop: "thickness", type: "range", min: 0.2, max: 0.9, step: 0.05, default: 0.5 },
      { prop: "fontSize", label: "cell", type: "range", min: 6, max: 18, default: 12 },
    ],
    Preview: ({ values: v }) => (
      <AsciiDonut
        charset={v.charset as string}
        color={palette(v.color)}
        speed={v.speed as number}
        thickness={v.thickness as number}
        fontSize={v.fontSize as number}
        className="h-96 w-full text-primary"
      />
    ),
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-donut", "AsciiDonut"),
        usesPalette(v.color) && imports("@/lib/ascii", "palettes"),
        "",
        jsx("AsciiDonut", [
          attr("charset", v.charset, "donut"),
          paletteAttr(v.color),
          attr("speed", v.speed, 1),
          attr("thickness", v.thickness, 0.5),
          attr("fontSize", v.fontSize, 12),
          'className="h-80 text-primary"',
        ]),
      ),
    examples: {
      thermal: () => <AsciiDonut color={palettes.thermal} className="h-64 w-full" />,
      braille: () => <AsciiDonut charset="braille" fontSize={10} className="h-64 w-full text-primary" />,
    },
    Thumb: () => <AsciiDonut fontSize={9} className="text-primary" />,
  },
  "ascii-globe": {
    controls: [
      { prop: "charset", type: "select", options: ["standard", "braille", "blocks", "dots", "detailed"], default: "standard" },
      { prop: "color", type: "swatch", options: inkSwatches, default: "ink" },
      { prop: "speed", type: "range", min: 0, max: 4, step: 0.1, default: 1 },
      { prop: "tilt", type: "range", min: -45, max: 45, step: 0.5, default: 23.5 },
      { prop: "land", type: "range", min: 0.05, max: 0.8, step: 0.05, default: 0.35 },
      { prop: "graticule", type: "boolean", default: true },
    ],
    Preview: ({ values: v }) => (
      <div className="grid w-full max-w-3xl items-center gap-8 p-8 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-4">
          <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">Edge network</span>
          <h3 className="text-3xl font-semibold tracking-tight text-balance text-foreground">
            Your app, a few milliseconds from everyone
          </h3>
          <p className="text-sm text-muted-foreground">
            Requests land on the closest of our points of presence and never cross an ocean unless they have to.
          </p>
          <dl className="mt-2 grid grid-cols-3 gap-4 border-t pt-4">
            {[
              ["310", "cities"],
              ["120", "countries"],
              ["<50ms", "to 95% of users"],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-mono text-xl font-semibold text-foreground tabular-nums">{n}</dd>
                <dd className="text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <AsciiGlobe
          charset={v.charset as string}
          dither={v.charset === "braille" ? "bayer" : undefined}
          color={palette(v.color)}
          speed={v.speed as number}
          tilt={v.tilt as number}
          land={v.land as number}
          graticule={v.graticule as boolean}
          className="mx-auto aspect-square w-64 text-primary sm:w-72"
        />
      </div>
    ),
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-globe", "AsciiGlobe"),
        usesPalette(v.color) && imports("@/lib/ascii", "palettes"),
        "",
        jsx(
          "section",
          ['className="grid items-center gap-8 sm:grid-cols-[1fr_auto]"'],
          "<h2>Your app, a few milliseconds from everyone</h2>\n" +
            jsx("AsciiGlobe", [
              attr("charset", v.charset, "standard"),
              v.charset === "braille" && 'dither="bayer"',
              paletteAttr(v.color),
              attr("speed", v.speed, 1),
              attr("tilt", v.tilt, 23.5),
              attr("land", v.land, 0.35),
              attr("graticule", v.graticule, true),
              'className="aspect-square w-72 text-primary"',
            ]),
        ),
      ),
    examples: {
      braille: () => (
        <AsciiGlobe charset="braille" dither="bayer" graticule={false} className="aspect-square w-72 text-primary" />
      ),
      ocean: () => (
        <AsciiGlobe land={0.2} seed={4} light={[0.9, 0.3, 0.5]} color={palettes.cyanotype} className="aspect-square w-72" />
      ),
    },
    Thumb: () => <AsciiGlobe fontSize={8} className="text-primary" />,
  },
}
