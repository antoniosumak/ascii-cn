"use client"

import { AsciiAreaChart } from "@/components/ascii/ascii-area-chart"
import { Bar, Caret, Collapse, Prompt, Spinner, Stage, States, Window, type Act } from "@/components/stageshow/kit"

import "./stage.css"

// Hero: one command in a terminal, and the component it adds draws itself
// into the app behind it. Beats: the command is typed; it runs; two files
// are created; the empty chart card in the app resolves into a real
// <AsciiAreaChart>, drawn by the engine. The payoff holds, then the
// terminal clears (its own `clear`) and the card empties again: the reset
// has a cause.
//
// Real strings: the address, the page title, the chart's label and total,
// the command and the two files it writes. The rest is placeholder.

type S = { typed: string; running: boolean; files: number; chart: boolean; loop: number }

const COMMAND = "npx shadcn add @asciicn/ascii-area-chart"
const FILES = ["components/ui/ascii-area-chart.tsx", "lib/ascii/engine.ts"]
const initial: S = { typed: "", running: false, files: 0, chart: false, loop: 0 }
const poster: S = { typed: COMMAND, running: false, files: 2, chart: true, loop: 0 }

const hours = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`)
const wave = (peak: number, base: number, at: number, seed: number) =>
  hours.map((_, h) => Math.round(base + peak * Math.exp(-(((h - at) / 4.5) ** 2)) + ((Math.sin(h * 1.7 + seed) + 1) / 2) * peak * 0.16))
const series = [
  { label: "today", data: wave(1100, 220, 14, 1) },
  { label: "yesterday", data: wave(860, 180, 15, 4), className: "text-[#5E5E5E]" },
]

async function script(a: Act<S>) {
  await a.wait(700)
  await a.click("term")
  await a.type("typed", COMMAND, { interval: 32 })
  await a.wait(250)
  await a.key("enter")
  a.mark("run")
  await a.set({ running: true })
  await a.wait(900)
  await a.set({ files: 1 })
  await a.wait(260)
  await a.set({ files: 2, running: false })
  await a.wait(350)
  a.mark("chart")
  await a.set((s) => ({ chart: true, loop: s.loop + 1 }))
  await a.move({ at: "card", x: 0.62, y: 0.7 })
  await a.wait(4200)
  // The terminal is cleared, and the card it filled empties with it
  await a.set({ chart: false })
  await a.wait(300)
  await a.set({ typed: "", files: 0 })
  await a.wait(500)
}

export function HeroStage() {
  return (
    <Stage<S>
      width={760}
      height={600}
      compact={{ below: 620, width: 358, height: 520 }}
      theme="dark"
      accent="#F4A93A"
      initial={initial}
      poster={poster}
      script={script}
      cursor={{ at: { wide: { x: 330, y: 540 }, compact: { x: 250, y: 330 } } }}
      tokens={{ "--ss-font": "var(--font-sans), system-ui, sans-serif", "--ss-mono": "var(--font-geist-mono), ui-monospace, monospace" }}
      fill
      className="hs"
    >
      {(s, _rect, layout) => (
        <>
          <Window url="localhost:3000/status" className="hs-win" receded={false}>
            <div className="hs-app">
              <nav className="hs-side">
                <Bar w={18} h={18} r={5} tone={4} />
                {[0, 1, 2, 3].map((i) => (
                  <Bar key={i} w={16} h={16} r={4} tone={i === 0 ? 5 : 2} />
                ))}
              </nav>
              <div className="hs-main">
                <div className="hs-head">
                  <div className="hs-title">Status</div>
                  <Bar w={64} h={24} r={6} tone={2} />
                </div>
                <div className="hs-card" data-target="card">
                  <div className="hs-card-head">
                    <div className="hs-label">Requests · last 24h</div>
                    <div className="hs-total">
                      <States
                        value={s.chart ? "on" : "off"}
                        align="start"
                        states={{ off: <Bar w={64} h={20} r={4} tone={2} style={{ marginTop: 4 }} />, on: <span>18.4k</span> }}
                      />
                    </div>
                  </div>
                  <div className="hs-plot ss-live">
                    <div className="hs-skeleton" data-hide={s.chart || undefined}>
                      {[56, 72, 64, 80, 68].map((w, i) => (
                        <Bar key={i} w={`${w}%`} h={7} r={3.5} tone={1} />
                      ))}
                    </div>
                    {s.chart && (
                      <AsciiAreaChart
                        key={s.loop}
                        series={series}
                        labels={hours}
                        width={layout === "compact" ? 36 : 64}
                        height={layout === "compact" ? 8 : 10}
                        min={0}
                        label="Requests over the last 24 hours"
                        className="hs-chart text-[#F4A93A]"
                        tabIndex={-1}
                      />
                    )}
                  </div>
                </div>
                <div className="hs-stats">
                  {[
                    [44, 52],
                    [52, 40],
                    [38, 58],
                  ].map(([l, v], i) => (
                    <div key={i} className="hs-stat">
                      <Bar w={l} h={6} tone={2} />
                      <Bar w={v} h={14} r={3} tone={3} />
                    </div>
                  ))}
                </div>
                <div className="hs-list">
                  {[120, 168, 140, 96].map((w, i) => (
                    <div key={i} className="hs-list-row">
                      <Bar w={w} h={7} r={3.5} tone={2} />
                      <Bar w={44} h={16} r={8} tone={1} />
                      <Bar w={28} h={7} r={3.5} tone={1} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Window>

          <Window chrome="terminal" title="northwind — zsh" className="hs-term">
            <div className="hs-term-body" data-target="term" data-cursor="ibeam">
              <Prompt path="~/app">
                {s.typed}
                {!s.running && s.files === 0 && <Caret still={s.typed.length > 0 && s.typed.length < COMMAND.length} />}
              </Prompt>
              <Collapse open={s.running || s.files > 0}>
                <div className="hs-term-out">
                  {FILES.map((f, i) => (
                    <div key={f} className="hs-term-line" data-on={s.files > i || undefined}>
                      <span className="hs-term-mark">
                        <States value={s.files > i ? "done" : "wait"} states={{ wait: <Spinner size={10} />, done: <span className="ok">✓</span> }} />
                      </span>
                      <span className={s.files > i ? "" : "dim"}>{f}</span>
                    </div>
                  ))}
                </div>
              </Collapse>
            </div>
          </Window>
        </>
      )}
    </Stage>
  )
}
