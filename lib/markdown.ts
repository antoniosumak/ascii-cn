import { canvasProps, meta } from "@/components/site/catalog/meta"
import type { Prop } from "@/components/site/catalog/types"
import { categories, categoryOf, components, getItem, inCategory, siteUrl } from "@/lib/site"

const fence = (code: string, lang = "tsx") => `\`\`\`${lang}\n${code}\n\`\`\``
const cell = (s: string) => s.replaceAll("|", "\|")
const table = (props: Prop[]) =>
  [
    "| Prop | Type | Default | Description |",
    "| --- | --- | --- | --- |",
    ...props.map(([n, t, d, desc]) => `| \`${n}\` | \`${cell(t)}\` | ${d === "—" ? "" : `\`${cell(d)}\``} | ${cell(desc)} |`),
  ].join("\n")

export function componentMarkdown(slug: string) {
  const item = getItem(slug)
  const m = meta[slug]
  if (!item || !m) return null
  const out = [
    `# ${item.title}`,
    `> ${item.description}`,
    `Category: ${categoryOf(item)?.title}. Docs: ${siteUrl}/docs/${slug}`,
    "## Installation",
    fence(`npx shadcn@latest add @asciicn/${slug}`, "bash"),
    `Needs the \`@asciicn\` registry in components.json: \`"registries": { "@asciicn": "${siteUrl}/r/{name}.json" }\`.`,
    "## Usage",
    fence(m.usage),
  ]
  if (m.examples?.length) {
    out.push("## Examples")
    for (const e of m.examples) out.push(`### ${e.title}`, e.description, fence(e.code))
  }
  if (m.props) {
    out.push("## Props", table(m.props))
    if (m.inherits) out.push("Also accepts every `AsciiCanvas` prop:", table(canvasProps))
  }
  if (m.notes) out.push("## Notes", m.notes.map(([label, text]) => `- **${label}.** ${text}`).join("\n"))
  return out.join("\n\n") + "\n"
}

export function llmsIndex() {
  return [
    "# asciicn",
    "> An ASCII engine and copy-paste components for React and shadcn/ui. Photos, video, backgrounds, type and terminal UI, drawn in characters and themed with CSS `color`.",
    "Components install as source with the shadcn CLI. Add the registry to components.json first:",
    fence(`{ "registries": { "@asciicn": "${siteUrl}/r/{name}.json" } }`, "json"),
    "Agent skill (engine plus SKILL.md): `npx shadcn@latest add @asciicn/asciicn-skill`",
    "## Docs",
    [
      `- [Introduction](${siteUrl}/docs)`,
      `- [Installation](${siteUrl}/docs/installation)`,
      `- [Theming](${siteUrl}/docs/theming)`,
      `- [Engine](${siteUrl}/docs/engine): AsciiCanvas, fields, frames, export`,
      `- [Catalog](${siteUrl}/docs/components)`,
    ].join("\n"),
    ...categories.flatMap((c) => [
      `## ${c.title}`,
      c.description,
      inCategory(c.id)
        .map((i) => `- [${i.title}](${siteUrl}/docs/${i.name}.md): ${i.description}`)
        .join("\n"),
    ]),
    "## Optional",
    `- [Full documentation](${siteUrl}/llms-full.txt): every component page in one file`,
  ].join("\n\n") + "\n"
}

export const llmsFull = () => [llmsIndex(), ...components.map((c) => componentMarkdown(c.name))].join("\n---\n\n")
