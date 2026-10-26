import { componentMarkdown } from "@/lib/markdown"
import { components } from "@/lib/site"

// Served at /docs/<slug>.md through a rewrite in next.config.ts.
export function generateStaticParams() {
  return components.map((c) => ({ slug: c.name }))
}

export async function GET(_req: Request, ctx: RouteContext<"/md/[slug]">) {
  const md = componentMarkdown((await ctx.params).slug)
  if (!md) return new Response("Not found", { status: 404 })
  return new Response(md, { headers: { "Content-Type": "text/markdown; charset=utf-8" } })
}
