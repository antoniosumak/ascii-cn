"use client"

import { Fragment, useEffect, useState } from "react"

import { AsciiAreaChart } from "@/components/ascii/ascii-area-chart"
import { AsciiBarChart, AsciiSparkline } from "@/components/ascii/ascii-chart"
import { AsciiColumnChart, columnGlyphs, type ColumnSeries } from "@/components/ascii/ascii-column-chart"
import { AsciiGauge } from "@/components/ascii/ascii-gauge"
import { AsciiHeatmap, formatDay, heatmapGlyphs, type HeatmapDatum } from "@/components/ascii/ascii-heatmap"
import { AsciiLineChart, fillGlyphs, type LineSeries } from "@/components/ascii/ascii-line-chart"
import { AsciiPieChart, type PieDatum } from "@/components/ascii/ascii-pie-chart"
import { AsciiUptime, uptimeGlyphs, uptimePercent, type UptimeDatum, type UptimeStatus } from "@/components/ascii/ascii-uptime"

import { attr, imports, indent, jsx, lines } from "./code"
import type { Demo, Values } from "./types"

const series: Record<string, number[]> = {
  growth: [3, 5, 4, 8, 6, 9, 12, 10, 14, 11, 15, 18, 16, 20, 17, 22, 21, 25, 24, 28],
  volatile: [12, 4, 18, 7, 22, 3, 16, 9, 25, 6, 19, 11, 27, 5, 14, 20, 8, 23, 10, 17],
  decline: [28, 26, 27, 23, 24, 20, 21, 18, 19, 15, 16, 14, 12, 13, 10, 11, 8, 9, 6, 5],
}

const frameworks = [
  { label: "react", value: 82 },
  { label: "vue", value: 46 },
  { label: "svelte", value: 31.5 },
  { label: "solid", value: 12.25 },
]

const services = [
  { name: "api", latency: [120, 132, 118, 140, 160, 152, 138, 129, 141, 133, 125, 119] },
  { name: "auth", latency: [80, 78, 85, 90, 82, 79, 95, 88, 84, 81, 77, 80] },
  { name: "search", latency: [220, 260, 310, 290, 340, 380, 360, 330, 300, 280, 250, 240] },
]

/** Seeded noise, so server and client render the same demo data. */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DAY = 86_400_000
const TODAY = Date.UTC(2026, 9, 26)
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const shortDate = (t: number) => `${MONTHS[new Date(t).getUTCMonth()]} ${new Date(t).getUTCDate()}`

const hours = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`)
const wave = (seed: number, peak: number, base: number, at: number) => {
  const r = random(seed)
  return hours.map((_, h) => Math.round(base + peak * Math.exp(-(((h - at) / 4.5) ** 2)) + r() * peak * 0.18))
}

type Dataset = { title: string; total: string; labels: string[]; series: LineSeries[]; min?: number; unit?: string }

const datasets: Record<string, Dataset> = {
  traffic: {
    title: "Visitors today",
    total: "18.4k",
    labels: hours,
    series: [
      { label: "today", data: wave(1, 1100, 220, 14) },
      { label: "yesterday", data: wave(2, 900, 200, 15), className: "text-muted-foreground" },
    ],
  },
  latency: {
    title: "API latency",
    total: "142ms",
    labels: hours,
    min: 0,
    unit: "ms",
    series: [
      { label: "p50", data: wave(3, 60, 90, 12) },
      { label: "p95", data: wave(4, 180, 220, 13), className: "text-amber-500" },
    ],
  },
  revenue: {
    title: "Monthly revenue",
    total: "$84k",
    labels: MONTHS,
    min: 0,
    series: [
      { label: "actual", data: [22, 26, 25, 31, 36, 34, 42, 47, 51, 58, 66, 84] },
      { label: "target", data: [25, 28, 31, 34, 37, 40, 44, 48, 52, 56, 61, 66], className: "text-muted-foreground" },
    ],
  },
}

const seriesCode = (list: LineSeries[]) =>
  `series={[\n${list
    .map((s) => indent(`{ label: "${s.label}", data: [${s.data.join(", ")}]${s.className ? `, className: "${s.className}"` : ""} },`))
    .join("\n")}\n]}`

const areas: Record<string, Dataset> = {
  sources: {
    title: "Visitors by source",
    total: "18.4k",
    labels: hours,
    series: [
      { label: "search", data: wave(5, 520, 90, 14) },
      { label: "direct", data: wave(6, 300, 60, 11), className: "text-sky-500" },
      { label: "social", data: wave(7, 220, 30, 19), className: "text-amber-500" },
    ],
  },
  memory: {
    title: "Memory",
    total: "1.2GB",
    labels: hours,
    min: 0,
    unit: "MB",
    series: [
      { label: "heap", data: wave(8, 320, 380, 9) },
      { label: "rss", data: wave(9, 420, 640, 10), className: "text-amber-500" },
    ],
  },
}

type Columns = { title: string; total: string; labels: string[]; series: ColumnSeries[]; unit?: string }

const columnSets: Record<string, Columns> = {
  deploys: {
    title: "Deploys per month",
    total: "611",
    labels: MONTHS.slice(0, 10),
    series: [
      { label: "2026", data: [42, 58, 51, 63, 49, 70, 66, 74, 61, 77] },
      { label: "2025", data: [31, 40, 38, 44, 52, 47, 50, 55, 49, 58], className: "text-muted-foreground" },
    ],
  },
  latency: {
    title: "p95 by region",
    total: "184ms",
    labels: ["iad", "sfo", "fra", "lhr", "sin", "syd", "gru"],
    unit: "ms",
    series: [
      { label: "p50", data: [42, 51, 64, 58, 120, 140, 160] },
      { label: "p95", data: [110, 128, 150, 142, 260, 310, 344], className: "text-amber-500" },
    ],
  },
}

const slices: Record<string, { title: string; unit?: string; data: PieDatum[] }> = {
  browsers: {
    title: "Visits by browser",
    unit: "k",
    data: [
      { label: "chrome", value: 412 },
      { label: "safari", value: 126 },
      { label: "firefox", value: 58 },
      { label: "edge", value: 31 },
      { label: "other", value: 17 },
    ],
  },
  storage: {
    title: "Storage",
    unit: "GB",
    data: [
      { label: "photos", value: 112 },
      { label: "video", value: 64, className: "text-sky-500" },
      { label: "apps", value: 38, className: "text-amber-500" },
      { label: "free", value: 42, className: "text-muted-foreground" },
    ],
  },
}

function contributions(density: string) {
  const r = random(density.length * 7)
  const rate = ({ busy: 0.85, steady: 0.6, sparse: 0.3 } as Record<string, number>)[density] ?? 0.6
  return Array.from({ length: 371 }, (_, i): HeatmapDatum => {
    const t = TODAY - (370 - i) * DAY
    const weekend = [0, 6].includes(new Date(t).getUTCDay())
    const burst = Math.sin(i / 23) > 0.6 ? 2 : 1
    const value = r() < rate * (weekend ? 0.35 : 1) ? Math.ceil(r() * 6 * burst) : 0
    return { date: new Date(t).toISOString().slice(0, 10), value }
  })
}

const heatColors: Record<string, string> = {
  primary: "var(--primary)",
  amber: "var(--color-amber-500)",
  sky: "var(--color-sky-500)",
  foreground: "var(--foreground)",
}
const heatClasses: Record<string, string> = {
  primary: "text-primary",
  amber: "text-amber-500",
  sky: "text-sky-500",
  foreground: "text-foreground",
}

function uptimeData(seed: number, days: number, incidents: string): UptimeDatum[] {
  const r = random(seed)
  const risk = incidents === "rocky" ? 0.12 : 0.03
  const notes = ["Elevated error rates", "Slow responses in eu-west", "Database failover", "Delayed deliveries"]
  return Array.from({ length: days }, (_, i) => {
    const x = r()
    const status: UptimeStatus = seed === 3 && i < 4 ? "none" : x < risk / 3 ? "down" : x < risk ? "degraded" : "up"
    const note = status === "down" || status === "degraded" ? notes[Math.floor(r() * notes.length)] : undefined
    return { label: shortDate(TODAY - (days - 1 - i) * DAY), status, note }
  })
}

export const statusPage = (days: number, incidents: string) =>
  ["API", "Dashboard", "Webhooks"].map((name, i) => ({ name, data: uptimeData(i + 1, days, incidents) }))

/** Nudges values every couple of seconds while `on`, and holds still under reduced motion. */
function useJitter(values: number[], on: boolean) {
  const [offsets, setOffsets] = useState<number[]>([])
  const count = values.length
  useEffect(() => {
    if (!on || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const nudge = (cur: number[]) => Array.from({ length: count }, (_, i) => Math.max(-12, Math.min(12, (cur[i] ?? 0) + (Math.random() - 0.5) * 8)))
    const id = setInterval(() => setOffsets(nudge), 1600)
    return () => clearInterval(id)
  }, [count, on])
  return values.map((n, i) => Math.min(100, Math.max(0, n + (on ? (offsets[i] ?? 0) : 0))))
}

const load = (v: number) => (v >= 85 ? "text-destructive" : v >= 70 ? "text-amber-500" : "text-primary")

function GaugePreview({ values: v }: { values: Values }) {
  const [cpu, mem, disk] = useJitter([v.value as number, 58, 81], v.live as boolean)
  const gauges = [
    { label: "cpu", value: cpu },
    { label: "memory", value: mem },
    { label: "disk", value: disk },
  ]
  return (
    <div className="w-full max-w-2xl p-6 sm:p-10">
      <div className="rounded-xl border bg-card p-5">
        <div className="mb-5 flex items-baseline justify-between">
          <p className="text-sm font-medium text-foreground">web-01</p>
          <p className="font-mono text-xs text-muted-foreground">eu-west · 12 cores</p>
        </div>
        <div className="flex flex-wrap justify-around gap-4 text-[10px] sm:gap-6 sm:text-sm">
          {gauges.map((g) => (
            <AsciiGauge
              key={g.label}
              value={g.value}
              label={g.label}
              width={v.width as number}
              sweep={Number(v.sweep)}
              ticks={v.ticks as number}
              format={(n) => `${Math.round(n)}%`}
              indicatorClassName={load(g.value)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export const chartsDemos: Record<string, Demo> = {
  "ascii-chart": {
    controls: [
      { prop: "data", label: "trend", type: "select", options: Object.keys(series), default: "growth" },
      { prop: "width", type: "range", min: 10, max: 36, default: 24, base: 32 },
    ],
    Preview: ({ values: v }) => {
      const data = series[v.data as string]
      const last = data.at(-1)!
      const change = Math.round(((last - data[0]) / data[0]) * 100)
      return (
        <div className="grid w-full max-w-md gap-4 p-4 sm:p-10">
          <div className="rounded-xl border bg-card p-4 sm:p-5">
            <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">Requests / min</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground tabular-nums">{last}k</span>
              <span className={change >= 0 ? "text-sm text-primary" : "text-sm text-destructive"}>
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
            </div>
            <AsciiSparkline data={data} label={`Requests per minute, ${v.data}`} className="mt-4 block text-xl leading-none text-primary sm:text-2xl" />
          </div>
          <div className="rounded-xl border bg-card p-4 sm:p-5">
            <p className="mb-3 font-mono text-xs tracking-wide text-muted-foreground uppercase">Usage</p>
            <AsciiBarChart
              data={frameworks}
              width={Math.round((v.width as number) / 2)}
              format={(n) => `${n}%`}
              className="text-xs sm:text-sm [&_[role=cell][aria-hidden]]:text-primary"
            />
          </div>
        </div>
      )
    },
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-chart", "AsciiBarChart", "AsciiSparkline"),
        "",
        jsx("AsciiSparkline", [`data={[${series[v.data as string].join(", ")}]}`, `label="Requests per minute, ${v.data}"`]),
        "",
        jsx("AsciiBarChart", [
          `data={[{ label: "react", value: 82 }, { label: "vue", value: 46 }]}`,
          attr("width", v.width, 32),
          "format={(v) => `${v}%`}",
        ]),
      ),
    examples: {
      table: () => (
        <div className="p-8">
          <table className="font-mono text-sm">
            <tbody>
              {services.map((s) => (
                <tr key={s.name}>
                  <td className="pr-6 text-muted-foreground">{s.name}</td>
                  <td className="pr-6">
                    <AsciiSparkline data={s.latency} min={0} max={400} label={`${s.name} latency`} className="text-primary" />
                  </td>
                  <td className="text-right tabular-nums">{s.latency.at(-1)}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    Thumb: () => (
      <div className="flex flex-col gap-4 text-xs">
        <AsciiSparkline data={series.growth} label="Growth" className="text-xl text-primary" />
        <AsciiBarChart data={frameworks} width={12} format={(n) => `${n}%`} />
      </div>
    ),
  },
  "ascii-line-chart": {
    controls: [
      { prop: "data", type: "select", options: Object.keys(datasets), default: "traffic" },
      { prop: "width", type: "range", min: 24, max: 64, default: 56, base: 60 },
      { prop: "height", type: "range", min: 6, max: 24, default: 14, base: 12 },
      { prop: "compare", type: "boolean", default: true },
    ],
    Preview: ({ values: v }) => {
      const d = datasets[v.data as string]
      return (
        <div className="w-full max-w-2xl p-6 sm:p-10">
          <div className="overflow-x-auto rounded-xl border bg-card p-5">
            <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{d.title}</p>
            <p className="mt-1 mb-4 text-3xl font-semibold text-foreground tabular-nums">{d.total}</p>
            <AsciiLineChart
              label={d.title}
              series={v.compare ? d.series : d.series.slice(0, 1)}
              labels={d.labels}
              min={d.min}
              width={v.width as number}
              height={v.height as number}
              format={(n) => `${n}${d.unit ?? ""}`}
              className="text-xs sm:text-sm"
            />
          </div>
        </div>
      )
    },
    code: (v) => {
      const d = datasets[v.data as string]
      return lines(
        imports("@/components/ascii/ascii-line-chart", "AsciiLineChart"),
        "",
        jsx("AsciiLineChart", [
          `label="${d.title}"`,
          seriesCode(v.compare ? d.series : d.series.slice(0, 1)),
          `labels={[${d.labels.map((l) => `"${l}"`).join(", ")}]}`,
          d.min !== undefined && `min={${d.min}}`,
          attr("width", v.width, 60),
          attr("height", v.height, 12),
          d.unit && `format={(v) => \`\${v}${d.unit}\`}`,
        ]),
      )
    },
    examples: {
      format: () => (
        <div className="w-full p-8">
          <AsciiLineChart
            label="API latency"
            series={datasets.latency.series}
            labels={hours}
            min={0}
            width={40}
            height={8}
            format={(n) => `${n}ms`}
            className="text-xs"
          />
        </div>
      ),
    },
    Thumb: () => (
      <AsciiLineChart
        label="Visitors"
        series={datasets.traffic.series}
        labels={hours}
        width={40}
        height={6}
        tabIndex={-1}
        className="text-[10px]"
      />
    ),
  },
  "ascii-area-chart": {
    controls: [
      { prop: "data", type: "select", options: Object.keys(areas), default: "sources" },
      { prop: "stacked", type: "boolean", default: true, base: false },
      { prop: "width", type: "range", min: 24, max: 64, default: 56, base: 60 },
      { prop: "height", type: "range", min: 6, max: 24, default: 14, base: 12 },
      { prop: "glyphs", type: "select", options: Object.keys(fillGlyphs), default: "shade" },
    ],
    Preview: ({ values: v }) => {
      const d = areas[v.data as string]
      return (
        <div className="w-full max-w-2xl p-6 sm:p-10">
          <div className="overflow-x-auto rounded-xl border bg-card p-5">
            <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{d.title}</p>
            <p className="mt-1 mb-4 text-3xl font-semibold text-foreground tabular-nums">{d.total}</p>
            <AsciiAreaChart
              label={d.title}
              series={d.series}
              labels={d.labels}
              min={d.min}
              stacked={v.stacked as boolean}
              width={v.width as number}
              height={v.height as number}
              glyphs={v.glyphs as string}
              format={(n) => `${n}${d.unit ?? ""}`}
              className="text-xs sm:text-sm"
            />
          </div>
        </div>
      )
    },
    code: (v) => {
      const d = areas[v.data as string]
      return lines(
        imports("@/components/ascii/ascii-area-chart", "AsciiAreaChart"),
        "",
        jsx("AsciiAreaChart", [
          `label="${d.title}"`,
          seriesCode(d.series),
          `labels={[${d.labels.map((l) => `"${l}"`).join(", ")}]}`,
          d.min !== undefined && `min={${d.min}}`,
          attr("stacked", v.stacked, false),
          attr("width", v.width, 60),
          attr("height", v.height, 12),
          attr("glyphs", v.glyphs, "shade"),
          d.unit && `format={(v) => \`\${v}${d.unit}\`}`,
        ]),
      )
    },
    examples: {
      overlap: () => (
        <div className="w-full p-8">
          <AsciiAreaChart
            label="Memory"
            series={areas.memory.series}
            labels={hours}
            min={0}
            width={40}
            height={8}
            format={(n) => `${n}MB`}
            className="text-xs"
          />
        </div>
      ),
    },
    Thumb: () => (
      <AsciiAreaChart label="Visitors by source" series={areas.sources.series} labels={hours} width={40} height={6} stacked tabIndex={-1} className="text-[10px]" />
    ),
  },
  "ascii-column-chart": {
    controls: [
      { prop: "data", type: "select", options: Object.keys(columnSets), default: "deploys" },
      { prop: "height", type: "range", min: 4, max: 14, default: 10 },
      { prop: "glyphs", type: "select", options: Object.keys(columnGlyphs), default: "shade" },
      { prop: "compare", type: "boolean", default: true },
    ],
    Preview: ({ values: v }) => {
      const d = columnSets[v.data as string]
      return (
        <div className="w-full max-w-2xl p-6 sm:p-10">
          <div className="overflow-x-auto rounded-xl border bg-card p-5">
            <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{d.title}</p>
            <p className="mt-1 mb-4 text-3xl font-semibold text-foreground tabular-nums">{d.total}</p>
            <AsciiColumnChart
              label={d.title}
              labels={d.labels}
              series={v.compare ? d.series : d.series.slice(0, 1)}
              height={v.height as number}
              glyphs={v.glyphs as string}
              format={(n) => `${n}${d.unit ?? ""}`}
              className="text-base sm:text-lg"
            />
          </div>
        </div>
      )
    },
    code: (v) => {
      const d = columnSets[v.data as string]
      return lines(
        imports("@/components/ascii/ascii-column-chart", "AsciiColumnChart"),
        "",
        jsx("AsciiColumnChart", [
          `label="${d.title}"`,
          `labels={[${d.labels.map((l) => `"${l}"`).join(", ")}]}`,
          seriesCode(v.compare ? d.series : d.series.slice(0, 1)),
          attr("height", v.height, 10),
          attr("glyphs", v.glyphs, "shade"),
          d.unit && `format={(v) => \`\${v}${d.unit}\`}`,
        ]),
      )
    },
    examples: {
      grouped: () => (
        <div className="p-8">
          <AsciiColumnChart
            label="Signups"
            labels={["Q1", "Q2", "Q3", "Q4"]}
            series={[
              { label: "2025", data: [120, 160, 140, 210], className: "text-muted-foreground" },
              { label: "2026", data: [180, 220, 260, 310] },
            ]}
            height={8}
            className="text-sm"
          />
        </div>
      ),
    },
    Thumb: () => (
      <AsciiColumnChart label="Deploys" labels={MONTHS.slice(0, 8)} series={[{ label: "deploys", data: columnSets.deploys.series[0].data.slice(0, 8) }]} height={6} tabIndex={-1} className="text-xs" />
    ),
  },
  "ascii-pie-chart": {
    controls: [
      { prop: "data", type: "select", options: Object.keys(slices), default: "browsers" },
      { prop: "innerRadius", label: "inner radius", type: "range", min: 0, max: 0.8, step: 0.1, default: 0 },
      { prop: "width", type: "range", min: 12, max: 32, default: 22, base: 24 },
      { prop: "legend", type: "boolean", default: true },
    ],
    Preview: ({ values: v }) => {
      const d = slices[v.data as string]
      return (
        <div className="w-full max-w-2xl p-6 sm:p-10">
          <div className="rounded-xl border bg-card p-5">
            <p className="mb-4 font-mono text-xs tracking-wide text-muted-foreground uppercase">{d.title}</p>
            <AsciiPieChart
              label={d.title}
              data={d.data}
              width={v.width as number}
              innerRadius={v.innerRadius as number}
              legend={v.legend as boolean}
              format={(n) => `${n}${d.unit ?? ""}`}
              className="text-xs sm:text-sm"
            />
          </div>
        </div>
      )
    },
    code: (v) => {
      const d = slices[v.data as string]
      return lines(
        imports("@/components/ascii/ascii-pie-chart", "AsciiPieChart"),
        "",
        jsx("AsciiPieChart", [
          `label="${d.title}"`,
          `data={[\n${d.data.map((s) => indent(`{ label: "${s.label}", value: ${s.value}${s.className ? `, className: "${s.className}"` : ""} },`)).join("\n")}\n]}`,
          attr("width", v.width, 24),
          attr("innerRadius", v.innerRadius, 0),
          attr("legend", v.legend, true),
          `format={(v) => \`\${v}${d.unit ?? ""}\`}`,
        ]),
      )
    },
    examples: {
      donut: () => (
        <div className="p-8">
          <AsciiPieChart label="Storage" data={slices.storage.data.slice(0, 3)} innerRadius={0.6} format={(n) => `${n}GB`} className="text-xs" />
        </div>
      ),
    },
    Thumb: () => <AsciiPieChart label="Browsers" data={slices.browsers.data} width={16} legend={false} innerRadius={0.5} tabIndex={-1} className="text-[10px]" />,
  },
  "ascii-heatmap": {
    controls: [
      { prop: "density", type: "select", options: ["busy", "steady", "sparse"], default: "steady" },
      { prop: "weeks", type: "range", min: 8, max: 53, default: 53 },
      { prop: "color", type: "swatch", options: heatColors, default: "primary" },
      { prop: "glyphs", type: "select", options: Object.keys(heatmapGlyphs), default: "shade" },
      { prop: "legend", type: "boolean", default: true },
    ],
    Preview: ({ values: v }) => {
      const data = contributions(v.density as string)
      const weeks = v.weeks as number
      const total = data.slice(-weeks * 7).reduce((n, d) => n + d.value, 0)
      return (
        <div className="w-full max-w-3xl p-6 sm:p-10">
          <div className="overflow-x-auto rounded-xl border bg-card p-5">
            <p className="mb-4 text-sm text-foreground">
              <span className="font-semibold tabular-nums">{total.toLocaleString("en-US")}</span> contributions in the last{" "}
              {weeks === 53 ? "year" : `${weeks} weeks`}
            </p>
            <AsciiHeatmap
              label="Contributions"
              data={data}
              weeks={weeks}
              legend={v.legend as boolean}
              glyphs={v.glyphs as string}
              format={(n, date) => `${n || "No"} contribution${n === 1 ? "" : "s"} on ${formatDay(date)}`}
              className={`text-xs sm:text-sm ${heatClasses[v.color as string]}`}
            />
          </div>
        </div>
      )
    },
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-heatmap", "AsciiHeatmap"),
        "",
        `// contributions: { date: "2026-10-26", value: 4 }[]`,
        jsx("AsciiHeatmap", [
          'label="Contributions"',
          "data={contributions}",
          attr("weeks", v.weeks, 53),
          attr("legend", v.legend, true),
          attr("glyphs", v.glyphs, "shade"),
          `className="${heatClasses[v.color as string]}"`,
        ]),
      ),
    examples: {
      habit: () => (
        <div className="w-full p-8">
          <AsciiHeatmap
            label="Running"
            data={contributions("sparse")}
            weeks={12}
            max={10}
            format={(n, date) => `${n} km on ${formatDay(date)}`}
            className="text-sm text-sky-500"
          />
        </div>
      ),
    },
    Thumb: () => <AsciiHeatmap label="Contributions" data={contributions("steady")} weeks={30} tabIndex={-1} className="text-xs text-primary" />,
  },
  "ascii-gauge": {
    controls: [
      { prop: "value", type: "range", min: 0, max: 100, default: 64 },
      { prop: "sweep", type: "select", options: ["270", "180"], default: "270" },
      { prop: "ticks", type: "range", min: 0, max: 10, default: 4, base: 0 },
      { prop: "width", type: "range", min: 12, max: 28, default: 20, base: 24 },
      { prop: "live", type: "boolean", default: true },
    ],
    Preview: GaugePreview,
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-gauge", "AsciiGauge"),
        "",
        jsx("AsciiGauge", [
          `value={${v.value}}`,
          'label="cpu"',
          attr("width", v.width, 24),
          v.sweep !== "270" && `sweep={${v.sweep}}`,
          attr("ticks", v.ticks, 0),
          "format={(v) => `${Math.round(v)}%`}",
          `indicatorClassName={${v.value} >= 85 ? "text-destructive" : "text-primary"}`,
        ]),
      ),
    examples: {
      half: () => (
        <div className="flex flex-wrap justify-center gap-8 p-8 text-xs">
          {[
            { label: "battery", value: 82 },
            { label: "signal", value: 46 },
            { label: "storage", value: 93 },
          ].map((g) => (
            <AsciiGauge key={g.label} value={g.value} label={g.label} sweep={180} ticks={4} width={20} indicatorClassName={load(g.value)} />
          ))}
        </div>
      ),
    },
    Thumb: () => (
      <div className="flex gap-6 text-[10px]">
        <AsciiGauge value={64} label="cpu" width={16} ticks={4} format={(n) => `${n}%`} />
        <AsciiGauge value={88} label="disk" width={16} ticks={4} format={(n) => `${n}%`} indicatorClassName="text-destructive" />
      </div>
    ),
  },
  "ascii-uptime": {
    controls: [
      { prop: "days", type: "range", min: 30, max: 90, default: 60 },
      { prop: "incidents", type: "select", options: ["calm", "rocky"], default: "calm" },
      { prop: "rows", type: "range", min: 1, max: 3, default: 2 },
      { prop: "glyphs", type: "select", options: Object.keys(uptimeGlyphs), default: "shade" },
      { prop: "legend", type: "boolean", default: true },
    ],
    Preview: ({ values: v }) => {
      const list = statusPage(v.days as number, v.incidents as string)
      const degraded = list.some((s) => s.data.at(-1)!.status !== "up")
      return (
        <div className="w-full max-w-2xl p-6 sm:p-10">
          <div className="overflow-x-auto rounded-xl border bg-card p-5">
            <p className={degraded ? "mb-5 text-sm font-medium text-amber-500" : "mb-5 text-sm font-medium text-primary"}>
              {degraded ? "Some systems degraded" : "All systems operational"}
            </p>
            <div className="flex flex-col gap-5 text-xs">
              {list.map((s, i) => (
                <AsciiUptime
                  key={s.name}
                  label={s.name}
                  data={s.data}
                  rows={v.rows as number}
                  glyphs={v.glyphs as string}
                  legend={(v.legend as boolean) && i === list.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      )
    },
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-uptime", "AsciiUptime"),
        "",
        `// days: ${v.days} entries like { label: "Oct 26", status: "degraded", note: "Slow responses" }`,
        jsx("AsciiUptime", ['label="API"', "data={days}", attr("rows", v.rows, 2), attr("glyphs", v.glyphs, "shade"), attr("legend", v.legend, true)]),
      ),
    examples: {
      compact: () => (
        <div className="grid w-full max-w-md grid-cols-[auto_1fr_auto] items-center gap-x-6 gap-y-2 p-8 font-mono text-xs">
          {statusPage(30, "rocky").map((s) => (
            <Fragment key={s.name}>
              <span className="text-muted-foreground">{s.name}</span>
              <AsciiUptime label={s.name} data={s.data} rows={1} legend={false} summary={false} />
              <span className="text-right tabular-nums">{uptimePercent(s.data).toFixed(1)}%</span>
            </Fragment>
          ))}
        </div>
      ),
    },
    Thumb: () => (
      <div className="flex w-full flex-col gap-4 text-[10px]">
        {statusPage(40, "rocky")
          .slice(0, 2)
          .map((s) => (
            <AsciiUptime key={s.name} label={s.name} data={s.data} legend={false} tabIndex={-1} />
          ))}
      </div>
    ),
  },
}
