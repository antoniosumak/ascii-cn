import type { Metadata } from "next"
import Link from "next/link"

import { ComponentGrid } from "@/components/site/component-grid"
import { Prose } from "@/components/site/docs"
import { categories, components, inCategory } from "@/lib/site"

export const metadata: Metadata = {
  title: "Catalog",
  description: "Every asciicn component, grouped by what it's for.",
}

export default function CatalogPage() {
  return (
    <div className="flex max-w-5xl flex-col gap-12">
      <Prose>
        <h1>Catalog</h1>
        <p className="text-base">
          {components.length} components on one engine, grouped by what they&apos;re for. Each installs as plain source
          into <code>components/ascii/</code>. Drop one in as it is, read it for technique, or point your agent at one and
          ask for a variation. For anything not here, <Link href="/docs/engine">write your own</Link>.
        </p>
      </Prose>
      {categories.map((c) => {
        const items = inCategory(c.id)
        return (
          <section key={c.id} id={c.id} className="flex scroll-mt-24 flex-col gap-4">
            <div className="flex items-end justify-between gap-4 border-b pb-3">
              <div>
                <h2 className="font-mono text-lg font-semibold">{c.title}</h2>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">{items.length}</span>
            </div>
            <ComponentGrid items={items} />
          </section>
        )
      })}
    </div>
  )
}
