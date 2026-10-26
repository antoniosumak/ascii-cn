import { canvasNotes } from "./shared"
import type { Meta } from "./types"

export const backgroundsMeta: Record<string, Meta> = {
  "ascii-background": {
    usage: `import { AsciiBackground } from "@/components/ascii/ascii-background"

export function Hero() {
  return (
    <section className="relative isolate">
      <AsciiBackground
        variant="topography"
        className="absolute inset-0 -z-10 text-primary/50"
      />
      <h1>Hello</h1>
    </section>
  )
}`,
    props: [
      ["variant", '"plasma" | "topography" | "clouds" | "ripple" | "tunnel" | "rain" | "starfield" | "metaballs" | "grid" | "waves" | "aurora"', '"plasma"', "Which field to draw. Ripple follows the pointer."],
      ["speed", "number", "1", "Time multiplier."],
      ["opacity", "boolean", "true", "Fade glyphs by tone."],
    ],
    inherits: true,
    examples: [
      {
        id: "ripple",
        title: "Pointer ripple",
        description: "`variant=\"ripple\"` centres the rings on the pointer while it is over the canvas, and drifts back to the middle when it leaves.",
        code: `<div className="relative h-64 overflow-hidden rounded-xl border">
  <AsciiBackground variant="ripple" className="absolute inset-0 text-primary" />
</div>`,
      },
      {
        id: "card",
        title: "Behind a card",
        description: "A faint `clouds` field behind content. Keep the alpha low (`text-primary/30`) so text stays readable, and mask the edges with a gradient.",
        code: `<div className="relative isolate overflow-hidden rounded-xl border p-6">
  <AsciiBackground
    variant="clouds"
    fontSize={10}
    className="absolute inset-0 -z-10 text-primary/30 [mask-image:linear-gradient(to_bottom,black,transparent)]"
  />
  <h3>Pro</h3>
  <p>$12 / month</p>
</div>`,
      },
      {
        id: "grid",
        title: "Retro grid",
        description: "`variant=\"grid\"` scrolls a perspective floor towards the viewer with its horizon at 40% height. Put the heading above the horizon, where only a faint glow sits, and map tone onto `palettes.sunset` so near lines glow hot and far ones fade to violet.",
        code: `import { palettes } from "@/lib/ascii"

<section className="relative isolate h-80 overflow-hidden rounded-xl bg-zinc-950">
  <AsciiBackground variant="grid" color={palettes.sunset} className="absolute inset-0 -z-10" />
  <h2 className="pt-14 text-center font-mono text-2xl font-bold tracking-[0.3em] text-white sm:text-4xl">
    NIGHT DRIVE
  </h2>
</section>`,
      },
    ],
    notes: canvasNotes("Rendered with `aria-hidden` and `pointer-events: none`, so it never steals focus or clicks from what sits on top."),
  },
  "ascii-matrix": {
    usage: `import { AsciiMatrix } from "@/components/ascii/ascii-matrix"

<div className="h-96">
  <AsciiMatrix className="text-primary" />
</div>`,
    props: [
      ["glyphs", "string", "katakana + digits", "Characters the rain is made of."],
      ["speed", "number", "14", "Rows per second for an average drop."],
      ["density", "number", "0.7", "0 to 1. Lower leaves longer gaps."],
    ],
    inherits: true,
    examples: [
      {
        id: "binary",
        title: "Binary rain",
        description: "Any string works as `glyphs`. Pair it with a palette for a green phosphor look that ignores the theme colour.",
        code: `import { palettes } from "@/lib/ascii"

<AsciiMatrix glyphs="01" color={palettes.matrix} density={0.5} />`,
      },
    ],
    notes: canvasNotes("Decorative, so it renders `aria-hidden`. Put real content on top of it."),
  },
  "ascii-donut": {
    usage: `import { AsciiDonut } from "@/components/ascii/ascii-donut"

<AsciiDonut className="h-80 text-primary" />`,
    props: [
      ["speed", "number", "1", "Rotation speed multiplier."],
      ["thickness", "number", "0.5", "Tube radius relative to the ring."],
      ["charset", "string", '"donut"', "The original .,-~:;=!*#$@ ramp."],
    ],
    inherits: true,
    examples: [
      {
        id: "thermal",
        title: "Thermal palette",
        description: "`color` takes gradient stops from faint to full ink, so the lit side glows hot.",
        code: `import { palettes } from "@/lib/ascii"

<AsciiDonut color={palettes.thermal} className="h-64" />`,
      },
      {
        id: "braille",
        title: "Braille",
        description: "Braille packs 2×4 dots into every cell, which gives four times the resolution at the same font size.",
        code: `<AsciiDonut charset="braille" fontSize={10} className="h-64 text-primary" />`,
      },
    ],
    notes: canvasNotes("Labelled \"Spinning ASCII donut\". Pass `aria-label` to describe it in your own words, or `aria-hidden` when it is decoration."),
  },
  "ascii-globe": {
    usage: `import { AsciiGlobe } from "@/components/ascii/ascii-globe"

<AsciiGlobe className="aspect-square w-80 text-primary" />`,
    props: [
      ["speed", "number", "1", "Rotation speed multiplier. 1 is one turn every 25 seconds."],
      ["tilt", "number", "23.5", "Axial tilt in degrees."],
      ["graticule", "boolean", "true", "Draw latitude and longitude lines every 30°."],
      ["land", "number", "0.35", "Share of the surface that is land, 0 to 1."],
      ["seed", "number", "0", "Picks a different set of continents."],
      ["light", "[x, y, z]", "[-0.5, 0.45, 0.75]", "Light direction in view space: x right, y up, z towards the viewer."],
    ],
    inherits: true,
    examples: [
      {
        id: "braille",
        title: "Braille",
        description: "Braille packs 2×4 dots into each cell, so coastlines come out far finer. Each dot is on or off, so add `dither=\"bayer\"` to keep the faint ocean and the shading across the terminator.",
        code: `<AsciiGlobe charset="braille" dither="bayer" graticule={false} className="aspect-square w-72 text-primary" />`,
      },
      {
        id: "ocean",
        title: "Water world",
        description: "`land` sets the share of the surface above sea level and `seed` picks another map. Moving the `light` to the side sweeps the terminator across the disc.",
        code: `import { palettes } from "@/lib/ascii"

<AsciiGlobe
  land={0.2}
  seed={4}
  light={[0.9, 0.3, 0.5]}
  color={palettes.cyanotype}
  className="aspect-square w-72"
/>`,
      },
    ],
    notes: [
      ["Continents", "Value-noise fbm is sampled at each point's 3D position on the sphere, so there is no seam at the date line and no pinching at the poles. Lighting stays fixed to the viewer while the planet turns under it."],
      ...canvasNotes("Labelled \"Rotating ASCII globe\" with `role=\"img\"`. Pass `aria-label` to describe what it stands for, or `aria-hidden` when it is decoration."),
    ],
  },
}
