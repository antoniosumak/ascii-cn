"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { AsciiText } from "@/components/ascii/ascii-text"
import { AsciiUptime } from "@/components/ascii/ascii-uptime"
import { statusPage } from "@/components/site/catalog/charts.demo"
import { managers, useManager, chooseManager, type Manager } from "@/components/site/install"
import { AsciiCanvas } from "@/lib/ascii"
import { cn } from "@/lib/utils"

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy"}
      className={cn("grid shrink-0 place-items-center text-[#8F8F8F] transition-colors hover:text-[#EDEDED]", className)}
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
    </button>
  )
}

export function HeroGarden({ className }: { className?: string }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    const img = new Image()
    img.onload = () => setImage(img)
    img.src = "/demo/garden.jpg"
    return () => {
      img.onload = null
    }
  }, [])
  return (
    <AsciiCanvas
      source={image}
      fontSize={9}
      color="source"
      backdrop={0.3}
      brightness={0.2}
      contrast={1.2}
      gamma={0.7}
      className={className}
      aria-hidden
    />
  )
}

export function HeroWord() {
  // Canvas can't resolve CSS variables, so read next/font's generated family name for Geist Mono. The font
  // only feeds the canvas, never the markup, so the server's fallback can't cause a hydration mismatch.
  const family =
    (typeof document !== "undefined" && getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono")) ||
    "monospace"
  return (
    <AsciiText
      text="characters."
      font={`700 160px ${family}`}
      fontSize={7}
      charset=" ░▒▓"
      className="w-[545px] max-w-full text-[#F4A93A] drop-shadow-[0_2px_10px_rgb(0_0_0/0.9)]"
    />
  )
}

export function InstallTerminal({ item }: { item: string }) {
  const manager = useManager()
  return (
    <div className="w-full overflow-hidden rounded-[14px] bg-[#0F0F0F] outline-1 -outline-offset-1 outline-[#222222]">
      <div className="flex h-[46px] items-center gap-1 border-b border-[#1E1E1E] pr-2.5 pl-3.5">
        <span className="mr-2 font-[family-name:var(--font-plex)] text-xs font-bold text-[#F4A93A]">[a]</span>
        <div role="tablist" aria-label="Package manager" className="flex gap-1">
          {(Object.keys(managers) as Manager[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={m === manager}
              onClick={() => chooseManager(m)}
              className="rounded-md px-2.5 py-[5px] font-mono text-xs text-[#6B6B6B] transition-colors hover:text-[#EDEDED] aria-selected:bg-[#1F1F1F] aria-selected:text-[#EDEDED]"
            >
              {m}
            </button>
          ))}
        </div>
        <CopyButton text={`${managers[manager]} shadcn@latest add ${item}`} className="ml-auto size-7" />
      </div>
      <div className="flex flex-col gap-2.5 overflow-x-auto px-[22px] py-5 font-mono text-sm whitespace-nowrap">
        <p>
          <span className="text-[#6B6B6B]">$ </span>
          <span className="text-[#EDEDED]">{managers[manager]} shadcn@latest add </span>
          <span className="text-[#F4A93A]">{item}</span>
        </p>
        <p className="text-[#6B6B6B]">
          <span className="text-[#F4A93A]">✓ </span>Created 2 files: components/ui/ascii-image.tsx, lib/ascii/engine.ts
        </p>
      </div>
    </div>
  )
}

export function UptimeFill() {
  return (
    <div className="flex w-full flex-col gap-9 text-[11px] md:px-6">
      {statusPage(90, "rocky")
        .slice(0, 2)
        .map((s) => (
          <AsciiUptime key={s.name} label={s.name} data={s.data} legend={false} tabIndex={-1} />
        ))}
    </div>
  )
}
