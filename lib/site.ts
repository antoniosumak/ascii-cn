import registry from "@/registry.json"

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://asciicn.sumak.dev"
export const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/asciicn/asciicn"

export type RegistryItem = (typeof registry.items)[number]

export const categories = [
  { id: "backgrounds", title: "Backgrounds", description: "Full-bleed animated fields for heroes, sections and cards." },
  { id: "images", title: "Images", description: "Photos, video and the camera, redrawn in characters." },
  { id: "text", title: "Type", description: "Display type and text effects made of glyphs." },
  { id: "interface", title: "Interface", description: "Terminal-style pieces for real UI: loaders, progress and frames." },
  { id: "charts", title: "Charts", description: "Data drawn with block elements, one character per value." },
] as const

export const inCategory = (id: string) =>
  registry.items.filter((i) => i.type === "registry:component" && i.categories?.includes(id))

/** Components in sidebar order, which is also the prev/next order. */
export const components = categories.flatMap((c) => inCategory(c.id))

export const getItem = (name: string) => registry.items.find((i) => i.name === name)

export const categoryOf = (item: RegistryItem) => categories.find((c) => item.categories?.includes(c.id))
