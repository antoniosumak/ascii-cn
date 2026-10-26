import { readFile } from "node:fs/promises"
import path from "node:path"

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { canvasProps, meta } from "@/components/site/catalog/meta"
import { CodeBlock } from "@/components/site/code-block"
import { Inline, Prose, PropsTable } from "@/components/site/docs"
import { InstallCommand } from "@/components/site/install"
import { PageActions } from "@/components/site/page-actions"
import { ComponentPreview, ExamplePreview } from "@/components/site/preview"
import { Toc, type TocItem } from "@/components/site/toc"
import { categoryOf, components, getItem } from "@/lib/site"

export function generateStaticParams() {
  return components.map((c) => ({ slug: c.name }))
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const item = getItem((await params).slug)
  return item ? { title: item.title, description: item.description } : {}
}

async function getSource(file: string) {
  "use cache"
  // Scoped to the components folder so the build doesn't trace the whole project.
  return readFile(path.join(process.cwd(), "components", "ascii", path.basename(file)), "utf8")
}

// The whole page depends on the slug, so the shared App Shell only carries this skeleton.
export default function ComponentPage({ params }: PageProps<"/docs/[slug]">) {
  return (
    <Suspense
      fallback={
        <div className="flex max-w-3xl animate-pulse flex-col gap-4">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-9 w-64 rounded bg-muted" />
          <div className="h-5 w-96 max-w-full rounded bg-muted" />
          <div className="mt-6 h-96 rounded-xl bg-muted" />
        </div>
      }
    >
      <ComponentDoc params={params} />
    </Suspense>
  )
}

async function ComponentDoc({ params }: Pick<PageProps<"/docs/[slug]">, "params">) {
  const { slug } = await params
  const item = getItem(slug)
  const m = meta[slug]
  if (!item || item.type !== "registry:component" || !m) notFound()

  const sources = await Promise.all(item.files.map(async (f) => ({ path: f.target, code: await getSource(f.path) })))
  const usesEngine = !!item.registryDependencies?.length
  const index = components.findIndex((c) => c.name === slug)
  const neighbour = (i: number) => {
    const c = components[i]
    return c ? { href: `/docs/${c.name}`, title: c.title } : null
  }
  const prev = neighbour(index - 1)
  const next = neighbour(index + 1)
  const markdown = `/docs/${slug}.md`

  const toc: TocItem[] = [
    { id: "installation", title: "Installation" },
    { id: "usage", title: "Usage" },
    ...(m.examples?.length
      ? [{ id: "examples", title: "Examples" }, ...m.examples.map((e) => ({ id: e.id, title: e.title, depth: 2 as const }))]
      : []),
    ...(m.props ? [{ id: "props", title: "Props" }] : []),
    ...(m.notes ? [{ id: "notes", title: "Notes" }] : []),
  ]

  return (
    <div className="flex gap-10">
      <Prose className="max-w-3xl min-w-0 flex-1">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs tracking-wide text-muted-foreground/70 uppercase">{categoryOf(item)?.title}</p>
            <h1>{item.title}</h1>
            <p className="max-w-lg text-base text-balance">{item.description}</p>
          </div>
          <PageActions markdown={markdown} prev={prev} next={next} />
        </div>

        <ComponentPreview name={slug} usage={m.usage} />

        <h2 id="installation">Installation</h2>
        <InstallCommand items={`@asciicn/${slug}`} />
        <p>
          {usesEngine ? (
            <>
              Pulls in the engine at <code>lib/ascii</code> on first install.{" "}
            </>
          ) : (
            <>No engine needed: this one is plain text and CSS. </>
          )}
          The <code>@asciicn</code> namespace needs one line in <code>components.json</code>, see{" "}
          <Link href="/docs/installation">Installation</Link>.
        </p>
        <details className="group rounded-lg border px-4 py-3">
          <summary className="cursor-pointer text-sm text-foreground">Manual installation</summary>
          <div className="mt-4 flex flex-col gap-4">
            {usesEngine && (
              <p>
                Install the engine first with <code>npx shadcn@latest add @asciicn/ascii-core</code>, or copy{" "}
                <code>lib/ascii</code> from the repository.
              </p>
            )}
            {sources.map((s) => (
              <div key={s.path} className="flex flex-col gap-2">
                <p>
                  Copy this into <code>{s.path}</code>:
                </p>
                <CodeBlock code={s.code} className="max-h-[28rem] overflow-y-auto" />
              </div>
            ))}
          </div>
        </details>

        <h2 id="usage">Usage</h2>
        <CodeBlock code={m.usage} />

        {m.examples?.length ? (
          <>
            <h2 id="examples">Examples</h2>
            {m.examples.map((e) => (
              <section key={e.id} className="flex flex-col gap-3">
                <h3 id={e.id}>{e.title}</h3>
                <p>
                  <Inline text={e.description} />
                </p>
                <ExamplePreview name={slug} id={e.id} code={e.code} />
              </section>
            ))}
          </>
        ) : null}

        {m.props && (
          <>
            <h2 id="props">Props</h2>
            <PropsTable props={m.props} />
            {m.inherits && (
              <details className="group">
                <summary className="cursor-pointer text-sm text-foreground">Engine props (inherited from AsciiCanvas)</summary>
                <div className="mt-3">
                  <PropsTable props={canvasProps} />
                </div>
              </details>
            )}
          </>
        )}

        {m.notes && (
          <>
            <h2 id="notes">Notes</h2>
            <ul className="flex flex-col gap-2">
              {m.notes.map(([label, text]) => (
                <li key={label}>
                  <strong>{label}.</strong> <Inline text={text} />
                </li>
              ))}
            </ul>
          </>
        )}

        <nav aria-label="Pagination" className="mt-10 flex justify-between gap-4 border-t pt-6 text-sm">
          {prev ? (
            <Link href={prev.href} className="flex items-center gap-2 rounded-md border px-3 py-2 text-foreground no-underline hover:bg-muted">
              <ArrowLeftIcon className="size-3.5" /> {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={next.href} className="flex items-center gap-2 rounded-md border px-3 py-2 text-foreground no-underline hover:bg-muted">
              {next.title} <ArrowRightIcon className="size-3.5" />
            </Link>
          )}
        </nav>
      </Prose>
      <aside className="hidden w-48 shrink-0 xl:block">
        <div className="sticky top-24">
          <Toc items={toc} markdown={markdown} />
        </div>
      </aside>
    </div>
  )
}
