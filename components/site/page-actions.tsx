"use client"

import { CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, CopyIcon, ExternalLinkIcon, FileTextIcon, LinkIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type Neighbour = { href: string; title: string } | null

const item =
  "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-muted-foreground hover:bg-muted hover:text-foreground"
const iconButton =
  "grid size-8 place-items-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

export function PageActions({ markdown, prev, next }: { markdown: string; prev: Neighbour; next: Neighbour }) {
  const [copied, setCopied] = useState(false)
  const menu = useRef<HTMLDetailsElement>(null)

  const flash = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  const copyPage = async () => {
    const text = await fetch(markdown).then((r) => r.text())
    await navigator.clipboard.writeText(text)
    flash()
  }

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (menu.current && !menu.current.contains(e.target as Node)) menu.current.open = false
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [])

  return (
    <div className="not-prose flex shrink-0 items-center gap-1.5">
      <div className="flex">
        <button
          type="button"
          onClick={copyPage}
          className="inline-flex h-8 items-center gap-1.5 rounded-l-md border px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
          Copy page
        </button>
        <details ref={menu} className="relative">
          <summary
            aria-label="More page actions"
            className="grid h-8 w-7 cursor-pointer list-none place-items-center rounded-r-md border border-l-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden"
          >
            <ChevronDownIcon className="size-3.5" />
          </summary>
          <div className="absolute right-0 z-30 mt-1 flex w-52 flex-col rounded-lg border bg-popover p-1 text-sm shadow-lg">
            <a href={markdown} className={item}>
              <FileTextIcon className="size-3.5" /> View as Markdown
            </a>
            {[
              { label: "Open in Claude", url: "https://claude.ai/new?q=" },
              { label: "Open in ChatGPT", url: "https://chatgpt.com/?q=" },
            ].map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => {
                  const page = new URL(markdown, location.href).href
                  window.open(a.url + encodeURIComponent(`Read ${page} and help me use this component.`), "_blank", "noreferrer")
                  menu.current!.open = false
                }}
                className={item}
              >
                <ExternalLinkIcon className="size-3.5" /> {a.label}
              </button>
            ))}
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(location.href.split("#")[0])
                menu.current!.open = false
                flash()
              }}
              className={item}
            >
              <LinkIcon className="size-3.5" /> Copy link
            </button>
          </div>
        </details>
      </div>
      {[
        { n: prev, icon: ChevronLeftIcon, label: "Previous" },
        { n: next, icon: ChevronRightIcon, label: "Next" },
      ].map(({ n, icon: Icon, label }) =>
        n ? (
          <Link key={label} href={n.href} aria-label={`${label}: ${n.title}`} title={n.title} className={iconButton}>
            <Icon className="size-4" />
          </Link>
        ) : (
          <span key={label} aria-hidden className={cn(iconButton, "opacity-40")}>
            <Icon className="size-4" />
          </span>
        ),
      )}
    </div>
  )
}
