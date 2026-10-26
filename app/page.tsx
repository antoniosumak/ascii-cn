import { ArrowRightIcon, ChevronRightIcon } from "lucide-react"
import * as motion from "motion/react-client"
import Link from "next/link"
import type { ReactNode } from "react"

import { AsciiDonut } from "@/components/ascii/ascii-donut"
import { AsciiGlobe } from "@/components/ascii/ascii-globe"
import { AsciiImageCompare } from "@/components/ascii/ascii-image-compare"
import { AsciiMatrix } from "@/components/ascii/ascii-matrix"
import { AsciiText } from "@/components/ascii/ascii-text"
import { MotionConfig } from "@/components/site/motion-config"
import { HeroGarden, UptimeFill, HeroWord, InstallTerminal } from "@/components/site/landing"
import { Thumb } from "@/components/site/preview"
import { Studio } from "@/app/studio/studio"
import { categories, categoryOf, components, getItem, githubUrl, inCategory } from "@/lib/site"
import { cn } from "@/lib/utils"

const shortTitle = (title: string) => title.replace(/^ASCII /, "")
const count = components.length

const bento: { names: string[]; cols: string; height: string }[] = [
  { names: ["ascii-matrix", "ascii-donut"], cols: "md:grid-cols-[2fr_1fr]", height: "h-[400px]" },
  { names: ["ascii-image-compare"], cols: "", height: "h-[420px] md:h-[580px]" },
  { names: ["ascii-chart", "ascii-scramble", "ascii-progress"], cols: "md:grid-cols-3", height: "h-[320px]" },
  { names: ["ascii-globe", "ascii-uptime"], cols: "md:grid-cols-[1fr_2fr]", height: "h-[380px]" },
  { names: ["ascii-avatar", "ascii-button", "ascii-heatmap"], cols: "md:grid-cols-3", height: "h-[300px]" },
]

const notes: Record<string, string> = {
  "ascii-donut": "A 1.00  B 0.60  · z-buffered",
  "ascii-image-compare": "drag the divider",
  "ascii-scramble": "on mount · on hover",
  "ascii-globe": "rotation 0.4 rad/s · lit",
}

const pieces = [
  {
    title: "The engine",
    body: "lib/ascii turns any source into a grid of glyphs: photos, video frames, canvas fields or text. It maps brightness to a charset, can dither with Bayer or Floyd-Steinberg, and draws to a canvas, a pre or plain spans. Colours come from your shadcn theme. Animation pauses offscreen and respects reduced motion.",
  },
  {
    title: "The components",
    body: `${count} React components built on the engine. Each one is a single file with typed props and no extra runtime dependencies beyond React.`,
  },
  {
    title: "The studio",
    body: "A page for trying settings on your own image, clip or text before you install. It gives you the props, a PNG or a TXT file.",
  },
]

const files = [
  ["components/ui/ascii-*.tsx", "One file per component, yours to edit."],
  ["lib/ascii/", "The engine. Added once, shared by every component."],
  ["globals.css", "--ascii-fg, --ascii-dim and --ascii-accent, read from your theme."],
  ["components.json", "The @asciicn registry entry, so the CLI knows where to look."],
]

const footerLinks = [
  {
    title: "Get started",
    links: [
      ["Introduction", "/docs"],
      ["Installation", "/docs/installation"],
      ["Theming", "/docs/theming"],
      ["The engine", "/docs/engine"],
    ],
  },
  { title: "Components", links: categories.map((c) => [c.title, `/docs/components#${c.id}`]) },
  {
    title: "Project",
    links: [
      ["Studio", "/studio"],
      ["Changelog", `${githubUrl}/releases`],
      ["GitHub", githubUrl],
      ["llms.txt", "/llms.txt"],
    ],
  },
]

const ease = [0.22, 1, 0.36, 1] as const
const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}
const stagger = (gap = 0.08, delay = 0) => ({ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } })
const inView = { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.2 } } as const

const container = "mx-auto w-full max-w-[1440px] px-4 md:px-8 xl:px-[120px]"

function SectionHeader({ title, body, className }: { title: string; body: string; className?: string }) {
  return (
    <motion.div {...inView} variants={stagger()} className={cn("flex flex-col gap-4", className)}>
      <motion.h2 variants={rise} className="text-4xl font-medium tracking-[-2px] text-balance text-[#EDEDED] md:text-[56px]">
        {title}
      </motion.h2>
      <motion.p variants={rise} className="max-w-[620px] text-lg leading-[27px] text-[#8F8F8F]">
        {body}
      </motion.p>
    </motion.div>
  )
}

function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-1.5 text-[15px] font-medium text-[#EDEDED]", className)}>
      {children}
      <ChevronRightIcon className="size-[15px] transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

const photo = { src: "/demo/garden.jpg", alt: "Marble columns among orange and pink flowers under a stormy sky" }

// Canvas components fill the card edge to edge; DOM thumbs are scaled up so they fill it too.
const fills: Record<string, ReactNode> = {
  "ascii-matrix": <AsciiMatrix fontSize={14} className="absolute inset-0 text-primary" />,
  "ascii-donut": <AsciiDonut fontSize={9} className="absolute inset-x-0 top-10 bottom-4 text-primary" />,
  "ascii-globe": <AsciiGlobe fontSize={8} className="absolute inset-x-0 top-10 bottom-4 text-primary" />,
  "ascii-uptime": <UptimeFill />,
  "ascii-image-compare": (
    <div className="relative h-full max-w-full overflow-hidden rounded-xl">
      <AsciiImageCompare {...photo} fontSize={5} className="h-full w-auto text-primary" />
      <span className="pointer-events-none absolute top-3 left-3 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[11px] text-[#EDEDED]">photo</span>
      <span className="pointer-events-none absolute top-3 right-3 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[11px] text-[#EDEDED]">ascii</span>
    </div>
  ),
}

const zoom: Record<string, number> = {
  "ascii-chart": 1.2,
  "ascii-scramble": 1.3,
  "ascii-progress": 1.2,
  "ascii-avatar": 2,
  "ascii-button": 1.5,
}

function Card({ name, height }: { name: string; height: string }) {
  const item = getItem(name)!
  return (
    <motion.div
      variants={rise}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-[20px] bg-[#121212] outline-1 -outline-offset-1 outline-[#1E1E1E] transition-[outline-color] hover:outline-[#2E2E2E]">
      <div
        className={cn(
          "dark relative grid place-items-center overflow-hidden bg-[radial-gradient(ellipse_60%_60%_at_50%_45%,#171717_0%,#101010_100%)] text-foreground",
          fills[name] ? "p-4 pt-12 md:p-6 md:pt-12" : "px-6 py-10 md:px-12",
          height,
        )}
      >
        {fills[name] ?? (
          <div className={cn("pointer-events-none", name === "ascii-heatmap" && "w-full")} style={{ zoom: zoom[name] }}>
            <Thumb name={name} />
          </div>
        )}
        {notes[name] && <span className="pointer-events-none absolute top-5 left-5 font-mono text-[11px] text-[#5E5E5E]">{notes[name]}</span>}
      </div>
      <Link
        href={`/docs/${name}`}
        className="flex h-[52px] items-center justify-between border-t border-[#1A1A1A] bg-[#0C0C0C] px-5 transition-colors hover:bg-[#101010]"
      >
        <span className="text-[15px] font-medium text-[#EDEDED]">{shortTitle(item.title)}</span>
        <span className="text-[13px] text-[#737373]">{categoryOf(item)?.title}</span>
      </Link>
    </motion.div>
  )
}

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="dark flex flex-col bg-[#0A0A0A] text-[#EDEDED]">
        <section className="relative overflow-hidden lg:h-[840px]">
          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease }}
            className="absolute inset-0 lg:left-auto lg:aspect-[1100/616]"
          >
            <HeroGarden className="absolute inset-0" />
            <div className="absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-[#0A0A0A] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-[#0A0A0A] to-transparent" />
          </motion.div>
          <div className="absolute inset-0 bg-linear-to-r from-[#0A0A0A] via-[#0A0A0A]/40 via-35% to-transparent to-60% max-lg:via-[#0A0A0A]/75 max-lg:to-[#0A0A0A]/40" />
          <div className={cn(container, "relative flex flex-col gap-12 pt-16 pb-12 lg:block lg:h-full lg:pt-[88px] lg:pb-0")}>
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger(0.09, 0.15)}
              className="relative z-10 flex max-w-[560px] flex-col items-start"
            >
              <motion.div variants={rise}>
                <Link
                  href="/docs/ascii-uptime"
                  className="flex items-center gap-2 rounded-full bg-[#0F0F0F] py-1.5 pr-3 pl-2 outline-1 -outline-offset-1 outline-[#232323] transition-colors hover:bg-[#151515]"
                >
                  <span className="rounded-full bg-[#F4A93A1F] px-[7px] py-0.5 font-mono text-[11px] text-[#F4A93A]">new</span>
                  <span className="text-[13px] text-[#BDBDBD]">Uptime and Gauge charts are in</span>
                  <ChevronRightIcon className="size-3.5 text-[#7A7A7A]" />
                </Link>
              </motion.div>
              <motion.h1
                variants={rise}
                className="mt-[30px] text-[56px] leading-none font-medium tracking-[-2px] text-[#F2F2F2] sm:text-[80px] sm:tracking-[-3.2px]">
                Interfaces,
                <br />
                drawn in
                <span className="sr-only"> characters.</span>
              </motion.h1>
              <motion.div variants={rise} className="mt-3.5 w-full" aria-hidden>
                <HeroWord />
              </motion.div>
              <motion.p variants={rise} className="mt-[30px] max-w-[500px] text-[19px] leading-[29px] text-[#A3A3A3]">
                Copy-paste components for React and shadcn/ui. Photos, video, type and terminal UI, drawn in glyphs and coloured by your theme.
              </motion.p>
              <motion.div variants={rise} className="mt-[30px] flex flex-wrap gap-2.5">
                <Link
                  href="/docs/installation"
                  className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#F4A93A] px-[18px] text-[15px] font-semibold text-[#1F1302] transition-[opacity,scale] hover:opacity-90 active:scale-[0.97]"
                >
                  Get started <ArrowRightIcon className="size-4" />
                </Link>
                <Link
                  href="/studio"
                  className="inline-flex h-11 items-center rounded-[10px] bg-[#111111] px-[18px] text-[15px] font-medium text-[#EDEDED] outline-1 -outline-offset-1 outline-[#2A2A2A] transition-[background-color,scale] hover:bg-[#161616] active:scale-[0.97]"
                >
                  Open the studio
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className={cn(container, "flex flex-col gap-14 py-20 lg:py-[120px]")}>
          <div className="flex flex-col items-start gap-4">
            <SectionHeader
              title="Start from an example."
              body={`${count} components in ${categories.length} groups, all drawn by the same engine. Install one as it is, or open it in the studio and change the charset, density and colour first.`}
            />
            <motion.div {...inView} variants={rise} className="pt-2">
              <ArrowLink href="/docs/components">See all {count} in the catalog</ArrowLink>
            </motion.div>
          </div>
          <div className="flex flex-col gap-3">
            {bento.map((row) => (
              <motion.div key={row.names[0]} {...inView} variants={stagger(0.1)} className={cn("grid gap-3", row.cols)}>
                {row.names.map((name) => (
                  <Card key={name} name={name} height={row.height} />
                ))}
              </motion.div>
            ))}
          </div>
        </section>

        <section className={cn(container, "flex flex-col gap-10 pt-10 pb-20 lg:pb-[120px]")}>
          <SectionHeader
            title="Tune it, then copy the code."
            body="The studio runs the same engine as the components. Drop in a photo, a clip or a line of text, pick a charset and a density, and copy the JSX it gives you."
          />
          <motion.div {...inView} variants={rise} className="rounded-[20px] bg-[#0E0E0E] p-4 outline-1 -outline-offset-1 outline-[#1E1E1E] md:p-6">
            <Studio />
          </motion.div>
        </section>

        <section className={cn(container, "flex flex-col gap-12 pt-20 pb-20 lg:pb-[120px]")}>
          <SectionHeader
            title="What's inside."
            body="asciicn is an open-source ASCII engine with a shadcn registry on top. Every component installs as source in your repo, so you can read it and change it."
          />
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <motion.div {...inView} variants={stagger()} className="flex flex-col">
              {pieces.map((p) => (
                <motion.div key={p.title} variants={rise} className="flex flex-col gap-2.5 border-t border-[#1E1E1E] py-6">
                  <h3 className="text-[17px] font-medium text-[#EDEDED]">{p.title}</h3>
                  <p className="text-[15px] leading-6 text-[#8F8F8F]">{p.body}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.div {...inView} variants={stagger(0.06)} className="flex flex-col">
              {categories.map((c) => {
                const items = inCategory(c.id)
                return (
                  <motion.div key={c.id} variants={rise}>
                    <Link
                      href={`/docs/components#${c.id}`}
                      className="group flex gap-6 border-t border-[#1E1E1E] py-5 max-sm:flex-col max-sm:gap-1"
                    >
                      <span className="flex w-[150px] shrink-0 items-end gap-2">
                        <span className="text-[17px] font-medium text-[#EDEDED]">{c.title}</span>
                        <span className="font-mono text-xs text-[#F4A93A]">{items.length}</span>
                      </span>
                      <span className="text-[15px] leading-6 text-[#8F8F8F] transition-colors group-hover:text-[#BDBDBD]">
                        {items.map((i) => shortTitle(i.title)).join(", ")}
                      </span>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        <section className="border-t border-[#1A1A1A]">
          <motion.div
            {...inView}
            variants={stagger()}
            className="mx-auto flex w-full max-w-[960px] flex-col items-center gap-6 px-4 pt-20 pb-24 md:px-8 lg:pt-[120px] lg:pb-[140px]"
          >
            <motion.h2 variants={rise} className="text-center text-4xl font-medium tracking-[-2px] text-balance text-[#EDEDED] md:text-[56px]">
              One command per component.
            </motion.h2>
            <motion.p variants={rise} className="max-w-[640px] text-center text-lg leading-[27px] text-[#8F8F8F]">
              Add the registry once, then pull in what you need with the shadcn CLI. The engine comes along with the first component and is shared by the rest.
            </motion.p>
            <div className="h-4" />
            <motion.div variants={rise} className="w-full">
              <InstallTerminal item="@asciicn/ascii-image" />
            </motion.div>
            <motion.dl variants={stagger(0.06)} className="grid w-full gap-x-10 pt-6 sm:grid-cols-2">
              {files.map(([path, body]) => (
                <motion.div key={path} variants={rise} className="flex flex-col gap-1.5 border-t border-[#1E1E1E] py-[18px]">
                  <dt className="font-mono text-sm font-medium text-[#EDEDED]">{path}</dt>
                  <dd className="text-sm leading-[21px] text-[#8F8F8F]">{body}</dd>
                </motion.div>
              ))}
            </motion.dl>
            <motion.div variants={rise} className="pt-4">
              <ArrowLink href="/docs/installation">Read the installation guide</ArrowLink>
            </motion.div>
          </motion.div>
        </section>

        <footer className="overflow-hidden border-t border-[#1A1A1A]">
          <div className={cn(container, "flex flex-col gap-14 pt-16")}>
            <div className="flex flex-wrap justify-between gap-12">
              <div className="flex w-[320px] max-w-full flex-col gap-3">
                <span className="font-[family-name:var(--font-plex)] text-[15px] font-bold">
                  <span className="text-[#F4A93A]">[a]</span> asciicn
                </span>
                <p className="text-sm leading-[21px] text-[#8F8F8F]">An ASCII engine and components for shadcn/ui. MIT licensed.</p>
              </div>
              <div className="flex flex-wrap gap-x-20 gap-y-10">
                {footerLinks.map((g) => (
                  <div key={g.title} className="flex w-[140px] flex-col gap-3 text-sm">
                    <span className="font-medium text-[#EDEDED]">{g.title}</span>
                    {g.links.map(([label, href]) => (
                      <Link key={label} href={href} className="text-[#7A7A7A] transition-colors hover:text-[#EDEDED]">
                        {label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: "40%" }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease }}
              className="-mb-[5%]"
            >
              <AsciiText
                text="asciicn"
                fontSize={14}
                className="text-[#F4A93A] [mask-image:linear-gradient(to_bottom,black_30%,rgb(0_0_0/0.35))]"
                aria-hidden
              />
            </motion.div>
          </div>
        </footer>
      </main>
    </MotionConfig>
  )
}
