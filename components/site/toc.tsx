"use client"

import { FileTextIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

export type TocItem = { id: string; title: string; depth?: 1 | 2 }

export function Toc({ items, markdown }: { items: TocItem[]; markdown?: string }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e)
    // The active heading is the last one that has scrolled past the top third of the viewport.
    const io = new IntersectionObserver(
      () => {
        const line = window.innerHeight / 3
        const passed = els.filter((e) => e.getBoundingClientRect().top < line)
        setActive((passed.at(-1) ?? els[0])?.id)
      },
      { rootMargin: "0px 0px -66% 0px", threshold: [0, 1] },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [items])

  return (
    <nav aria-label="On this page" className="flex flex-col gap-1 text-sm">
      <p className="mb-2 font-mono text-xs tracking-wide text-muted-foreground/70 uppercase">On this page</p>
      {items.map((i) => (
        <a
          key={i.id}
          href={`#${i.id}`}
          aria-current={i.id === active ? "location" : undefined}
          className={cn(
            "py-0.5 text-muted-foreground transition-colors hover:text-foreground aria-[current]:text-foreground",
            i.depth === 2 && "pl-3",
          )}
        >
          {i.title}
        </a>
      ))}
      {markdown && (
        <a
          href={markdown}
          className="mt-4 flex items-center gap-1.5 border-t pt-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          <FileTextIcon className="size-3.5" /> View as Markdown
        </a>
      )}
    </nav>
  )
}
