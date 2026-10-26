import Link from "next/link"

import { Thumb } from "@/components/site/preview"
import type { RegistryItem } from "@/lib/site"

export function ComponentGrid({ items }: { items: RegistryItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => (
        <Link key={c.name} href={`/docs/${c.name}`} className="group flex flex-col gap-2.5 outline-none">
          <div className="pointer-events-none grid h-44 place-items-center overflow-hidden rounded-xl border bg-card p-4 text-foreground transition-colors group-hover:border-primary/50 group-focus-visible:ring-2 group-focus-visible:ring-ring [&>*]:max-h-full">
            <Thumb name={c.name} />
          </div>
          <div className="flex flex-col gap-0.5 px-0.5">
            <p className="text-sm font-medium text-foreground">{c.title.replace(/^ASCII /, "")}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{c.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
