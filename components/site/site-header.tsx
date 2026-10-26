import { SearchIcon } from "lucide-react"
import Link from "next/link"

import { githubUrl } from "@/lib/site"

const links = [
  { href: "/docs", label: "Docs" },
  { href: "/docs/components", label: "Components" },
  { href: "/studio", label: "Studio" },
  { href: `${githubUrl}/releases`, label: "Changelog" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-6 px-4 md:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="font-[family-name:var(--font-plex)] text-[15px] font-bold">
            <span className="text-primary">[a]</span> asciicn
          </Link>
          <nav className="flex gap-7 text-sm text-muted-foreground max-md:hidden">
            {links.map((l) => (
              <Link key={l.label} href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/docs/components"
            className="flex h-[34px] w-[220px] items-center gap-2 rounded-lg bg-muted/50 pr-2.5 pl-3 text-[13px] text-muted-foreground outline-1 -outline-offset-1 outline-border transition-colors hover:text-foreground max-lg:hidden"
          >
            <SearchIcon className="size-3.5" />
            <span className="flex-1">Search components</span>
            <kbd className="rounded px-1.5 py-0.5 font-mono text-[11px] outline-1 -outline-offset-1 outline-border">⌘K</kbd>
          </Link>
          <a
            href={githubUrl}
            className="flex h-[34px] items-center gap-2 rounded-lg px-3 text-[13px] outline-1 -outline-offset-1 outline-border transition-colors hover:bg-muted/50"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-[15px]" aria-hidden>
              <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.1.9 2.2v3.3c0 .3.1.7.8.6A12 12 0 0 0 12 .3" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </header>
  )
}
