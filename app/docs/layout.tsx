import { DocsNav, type NavSection } from "@/components/site/docs-nav"
import { categories, inCategory } from "@/lib/site"

const sections: NavSection[] = [
  {
    title: "Get started",
    links: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/installation", label: "Installation" },
      { href: "/docs/theming", label: "Theming" },
    ],
  },
  {
    title: "Components",
    links: [{ href: "/docs/components", label: "Catalog" }],
    group: categories.map((c) => ({
      title: c.title,
      links: inCategory(c.id).map((i) => ({ href: `/docs/${i.name}`, label: i.title.replace(/^ASCII /, "") })),
    })),
  },
  {
    title: "Engine",
    links: [
      { href: "/docs/engine", label: "AsciiCanvas" },
      { href: "/studio", label: "Studio" },
    ],
  },
]

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row md:gap-10 md:py-10">
      <details className="rounded-lg border px-4 py-3 md:hidden">
        <summary className="cursor-pointer font-mono text-sm">Browse docs</summary>
        <nav className="mt-4 flex flex-col gap-6">
          <DocsNav sections={sections} />
        </nav>
      </details>
      <aside className="hidden shrink-0 md:block md:w-52">
        <nav className="sticky top-24 flex max-h-[calc(100svh-7rem)] flex-col gap-6 overflow-y-auto pb-6">
          <DocsNav sections={sections} />
        </nav>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
