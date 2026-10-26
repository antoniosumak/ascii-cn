"use client"

import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense } from "react"

import { cn } from "@/lib/utils"

type NavLink = { href: string; label: string }
export type NavSection = { title: string; links: NavLink[]; group?: { title: string; links: NavLink[] }[] }

function Item({ link, active, nested }: { link: NavLink; active: boolean; nested?: boolean }) {
  return (
    <Link
      href={link.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground",
        nested && "ml-3",
        active && "bg-muted font-medium text-foreground",
      )}
    >
      {link.label}
    </Link>
  )
}

function ActiveNav({ sections }: { sections: NavSection[] }) {
  return <Nav sections={sections} path={usePathname()} />
}

// usePathname is URL data, so it suspends below dynamic params; the fallback is the same nav without highlighting.
export function DocsNav({ sections }: { sections: NavSection[] }) {
  return (
    <Suspense fallback={<Nav sections={sections} path={null} />}>
      <ActiveNav sections={sections} />
    </Suspense>
  )
}

function Nav({ sections, path }: { sections: NavSection[]; path: string | null }) {
  return (
    <>
      {sections.map((s) => (
        <div key={s.title} className="flex flex-col gap-0.5">
          <p className="mb-1 px-2 text-sm font-medium text-foreground">{s.title}</p>
          {s.links.map((l) => (
            <Item key={l.href} link={l} active={l.href === path} />
          ))}
          {s.group?.map((g) => (
            <details key={g.title} open={g.links.some((l) => l.href === path) || undefined} className="group">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                <ChevronRightIcon className="size-3.5 transition-transform group-open:rotate-90" />
                {g.title}
                <span className="ml-auto font-mono text-xs text-muted-foreground/60 tabular-nums">{g.links.length}</span>
              </summary>
              <div className="flex flex-col gap-0.5 py-0.5">
                {g.links.map((l) => (
                  <Item key={l.href} link={l} active={l.href === path} nested />
                ))}
              </div>
            </details>
          ))}
        </div>
      ))}
    </>
  )
}
