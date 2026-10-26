import type { Metadata } from "next"
import type { ReactNode } from "react"

import { AsciiDonut } from "@/components/ascii/ascii-donut"
import { AsciiGlobe } from "@/components/ascii/ascii-globe"
import { AsciiImage } from "@/components/ascii/ascii-image"
import { AsciiImageCompare } from "@/components/ascii/ascii-image-compare"
import { AsciiMatrix } from "@/components/ascii/ascii-matrix"
import { UptimeFill } from "@/components/site/landing"
import { Thumb } from "@/components/site/preview"
import { categories, categoryOf, components, getItem, inCategory } from "@/lib/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Showcase",
  robots: { index: false },
}

// Six columns, five rows: each row's spans add up to 6.
const tiles = [
  "ascii-matrix", "ascii-gauge", "ascii-line-chart", "ascii-column-chart", "ascii-donut",
  "ascii-image", "ascii-globe", "ascii-pie-chart", "ascii-image-compare", "ascii-text",
  "ascii-scramble", "ascii-avatar", "ascii-heatmap", "ascii-progress", "ascii-button", "ascii-area-chart",
  "ascii-uptime", "ascii-video", "ascii-spinner", "ascii-box", "ascii-chart",
  "ascii-background", "ascii-dissolve", "ascii-skeleton", "ascii-divider", "ascii-scroll-reveal", "ascii-marquee",
]
const wide = new Set(["ascii-matrix", "ascii-image-compare", "ascii-uptime"])

const fills: Record<string, ReactNode> = {
  "ascii-matrix": <AsciiMatrix fontSize={12} className="absolute inset-0 text-primary" />,
  "ascii-donut": <AsciiDonut fontSize={6} className="absolute inset-3 text-primary" />,
  "ascii-globe": <AsciiGlobe fontSize={6} className="absolute inset-3 text-primary" />,
  "ascii-uptime": <UptimeFill />,
  "ascii-image": (
    <AsciiImage src="/demo/cabin.jpg" alt="A cabin by a lake" fontSize={6} color="source" brightness={0.35} contrast={1.2} className="max-w-40" />
  ),
  "ascii-image-compare": (
    <AsciiImageCompare src="/demo/garden.jpg" alt="Marble columns among flowers" fontSize={4} className="h-full w-auto rounded-lg text-primary" />
  ),
}

function Tile({ name }: { name: string }) {
  const item = getItem(name)!
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-2xl bg-[#121212] outline-1 -outline-offset-1 outline-[#1E1E1E]",
        wide.has(name) && "col-span-2",
      )}
    >
      <div className="dark relative grid h-[220px] place-items-center overflow-hidden bg-[radial-gradient(ellipse_60%_60%_at_50%_45%,#171717_0%,#101010_100%)] p-5 text-foreground">
        {fills[name] ?? (
          <div className="pointer-events-none grid size-full place-items-center">
            <Thumb name={name} />
          </div>
        )}
      </div>
      <div className="flex h-11 items-center justify-between border-t border-[#1A1A1A] bg-[#0C0C0C] px-4">
        <span className="text-[13px] font-medium text-[#EDEDED]">{item.title.replace(/^ASCII /, "")}</span>
        <span className="text-[11px] text-[#737373]">{categoryOf(item)?.title}</span>
      </div>
    </div>
  )
}

export default function ShowcasePage() {
  return (
    <main className="dark flex flex-col gap-8 bg-[#0A0A0A] px-12 py-12 text-[#EDEDED]">
      {/* A capture surface, not a site page: drop the sticky site header. */}
      <style>{"body > header { display: none }"}</style>
      <div className="flex items-end justify-between gap-8">
        <h1 className="text-[44px] leading-none font-medium tracking-[-1.5px]">
          Everything in <span className="font-mono text-[#F4A93A]">asciicn</span>.
        </h1>
        <div className="flex flex-col items-end gap-2 text-right">
          <p className="text-[15px] text-[#8F8F8F]">
            {components.length} components in {categories.length} groups, all drawn by one engine.
          </p>
          <p className="font-mono text-[12px] text-[#5E5E5E]">
            {categories.map((c) => `${c.title} ${inCategory(c.id).length}`).join("  ·  ")}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-3">
        {tiles.map((name) => (
          <Tile key={name} name={name} />
        ))}
      </div>
    </main>
  )
}
