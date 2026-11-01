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
import { UptimeFill, HeroWord, InstallTerminal } from "@/components/site/landing"
import { HeroStage } from "@/components/site/stage/hero-stage"
import { SourceStage, StudioStage, ThemeStage } from "@/components/site/stage/feature-stages"
import { Thumb } from "@/components/site/preview"
import { Studio } from "@/app/studio/studio"
import { categories, categoryOf, components, getItem, githubUrl } from "@/lib/site"
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

const files = [
  ["components/ui/ascii-*.tsx", "One file per component, yours to edit."],
  ["lib/ascii/", "The engine. Added once, shared by every component."],
  ["globals.css", "--ascii-fg, --ascii-dim and --ascii-accent, read from your theme."],
  ["components.json", "The @asciicn registry entry, so the CLI knows where to look."],
]

const steps = [
  {
    n: "01",
    title: "It lands as source",
    body: "One command writes the component to components/ui and the engine to lib/ascii. No runtime package to update: read it, change it, ship it.",
    stage: <SourceStage />,
  },
  {
    n: "02",
    title: "Your theme colours it",
    body: "Glyphs are inked with --ascii-accent and your shadcn tokens, so a theme change recolours every component at once.",
    stage: <ThemeStage />,
  },
  {
    n: "03",
    title: "The studio tunes it",
    body: "Try charset, cell size and colour on your own photo, clip or text, then copy the props it gives you.",
    stage: <StudioStage />,
  },
]

const stats = [
  [String(count), "components"],
  [String(categories.length), "groups"],
  ["1", "shared engine"],
  ["0", "runtime deps"],
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
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_50%_60%_at_78%_30%,rgb(244_169_58/0.07),transparent_70%)]" />
          <div
            className={cn(
              container,
              "relative grid grid-cols-1 items-center gap-12 pt-16 pb-16 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:gap-6 lg:pt-[72px] lg:pb-24 xl:pr-0",
            )}
          >
            <motion.div initial="hidden" animate="show" variants={stagger(0.09, 0.15)} className="relative z-10 flex min-w-0 flex-col items-start">
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
                className="mt-[30px] text-[52px] leading-none font-medium tracking-[-2px] text-[#F2F2F2] sm:text-[72px] sm:tracking-[-3px]"
              >
                Interfaces,
                <br />
                drawn in
                <span className="sr-only"> characters.</span>
              </motion.h1>
              <motion.div variants={rise} className="mt-3 w-full max-w-[480px]" aria-hidden>
                <HeroWord />
              </motion.div>
              <motion.p variants={rise} className="mt-7 max-w-[460px] text-lg leading-7 text-[#A3A3A3]">
                Copy-paste components for React and shadcn/ui. Charts, photos, video, type and terminal UI, drawn in glyphs and coloured by your theme.
              </motion.p>
              <motion.div variants={rise} className="mt-8 flex flex-wrap gap-2.5">
                <Link
                  href="/docs/installation"
                  className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#F4A93A] px-[18px] text-[15px] font-semibold text-[#1F1302] transition-[opacity,scale] hover:opacity-90 active:scale-[0.97]"
                >
                  Get started <ArrowRightIcon className="size-4" />
                </Link>
                <Link
                  href="/docs/components"
                  className="inline-flex h-11 items-center rounded-[10px] bg-[#111111] px-[18px] text-[15px] font-medium text-[#EDEDED] outline-1 -outline-offset-1 outline-[#2A2A2A] transition-[background-color,scale] hover:bg-[#161616] active:scale-[0.97]"
                >
                  Browse {count} components
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease, delay: 0.3 }}
              className="relative min-w-0"
            >
              <HeroStage />
            </motion.div>
          </div>
          <div className="border-y border-[#1A1A1A]">
            <motion.dl {...inView} variants={stagger(0.06)} className={cn(container, "grid grid-cols-2 md:grid-cols-4")}>
              {stats.map(([value, label], i) => (
                <motion.div
                  key={label}
                  variants={rise}
                  className={cn(
                    "flex items-baseline gap-2.5 py-6 md:py-7",
                    i > 0 && "md:border-l md:border-[#1A1A1A] md:pl-8",
                    i % 2 === 1 && "max-md:border-l max-md:border-[#1A1A1A] max-md:pl-5",
                    i > 1 && "max-md:border-t max-md:border-[#1A1A1A]",
                  )}
                >
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-mono text-[28px] font-medium tracking-tight text-[#F4A93A]">{value}</dd>
                  <dd className="text-sm text-[#8F8F8F]">{label}</dd>
                </motion.div>
              ))}
            </motion.dl>
          </div>
        </section>

        <section className={cn(container, "flex flex-col gap-14 pt-20 lg:pt-[120px]")}>
          <SectionHeader
            title="One command, then it's yours."
            body="asciicn is an engine plus a shadcn registry. Every component installs as a file in your repo, takes its colours from your theme and can be tuned before you copy it."
          />
          <motion.div {...inView} variants={stagger(0.1)} className="grid gap-3 lg:grid-cols-3">
            {steps.map((step) => (
              <motion.div
                key={step.n}
                variants={rise}
                className="flex min-w-0 flex-col overflow-hidden rounded-[20px] bg-[#121212] outline-1 -outline-offset-1 outline-[#1E1E1E]"
              >
                <div className="w-full">{step.stage}</div>
                <div className="flex flex-col gap-2 border-t border-[#1A1A1A] px-6 pt-5 pb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-[#F4A93A]">{step.n}</span>
                    <h3 className="text-[17px] font-medium text-[#EDEDED]">{step.title}</h3>
                  </div>
                  <p className="text-[15px] leading-6 text-[#8F8F8F]">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
