"use client"

import { useEffect, useState } from "react"

import { AsciiGlobe } from "@/components/ascii/ascii-globe"
import { AsciiCanvas } from "@/lib/ascii"
import { Bar, Code, Collapse, Roll, Stage, Window, type Act } from "@/components/stageshow/kit"

import "./stage.css"

const look = {
  theme: "dark" as const,
  accent: "#F4A93A",
  tokens: { "--ss-font": "var(--font-sans), system-ui, sans-serif", "--ss-mono": "var(--font-geist-mono), ui-monospace, monospace" },
}

/* ------------------------------------------------------------------ */
/* Theme: one token in a panel, and the real globe it colours.        */
/* ------------------------------------------------------------------ */

const SWATCHES = [
  { name: "amber", hex: "#F4A93A" },
  { name: "sky", hex: "#38BDF8" },
  { name: "lime", hex: "#A3E635" },
]

type ThemeS = { swatch: number }

async function themeScript(a: Act<ThemeS>) {
  await a.wait(1200)
  await a.click("sw-1")
  await a.set({ swatch: 1 })
  await a.wait(1800)
  await a.click("sw-2")
  await a.set({ swatch: 2 })
  await a.wait(1800)
  await a.click("sw-0")
  await a.set({ swatch: 0 })
  await a.move({ at: "sw-0", x: 0.5, y: 3 })
  await a.wait(1400)
}

export function ThemeStage() {
  return (
    <Stage<ThemeS>
      width={400}
      height={300}
      {...look}
      initial={{ swatch: 0 }}
      poster={{ swatch: 1 }}
      script={themeScript}
      cursor={{ at: { x: 330, y: 280 }, ripple: true }}
      className="st st-theme"
    >
      {(s) => (
        <>
          <Window url="localhost:3000" className="st-theme-win">
            <div className="st-theme-body ss-live">
              <div className="st-theme-donut">
                <AsciiGlobe fontSize={7} className="size-full" style={{ color: SWATCHES[s.swatch].hex }} aria-hidden />
              </div>
            </div>
          </Window>
          <div className="st-panel">
            <div className="st-panel-label">--ascii-accent</div>
            <div className="st-swatches">
              {SWATCHES.map((w, i) => (
                <span
                  key={w.name}
                  className="st-swatch"
                  data-target={`sw-${i}`}
                  data-cursor="pointer"
                  data-on={i === s.swatch || undefined}
                  style={{ ["--c" as string]: w.hex }}
                />
              ))}
            </div>
            <div className="st-panel-value">
              <Roll>{SWATCHES[s.swatch].hex}</Roll>
            </div>
          </div>
        </>
      )}
    </Stage>
  )
}

/* ------------------------------------------------------------------ */
/* Studio: a close-up of one slider, and the real image re-drawn.     */
/* ------------------------------------------------------------------ */

const MIN = 5
const MAX = 12
type StudioS = { size: number }
const rail = (t: number, from: { x: number; y: number }, to: { x: number; y: number }) => ({ x: from.x + (to.x - from.x) * t, y: from.y })

function useGarden() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    const img = new Image()
    img.onload = () => setImage(img)
    img.src = "/demo/garden.jpg"
    return () => {
      img.onload = null
    }
  }, [])
  return image
}

async function studioScript(a: Act<StudioS>) {
  await a.wait(900)
  const track = a.rect("track")
  const at = (v: number) => ({ x: track.x + ((v - MIN) / (MAX - MIN)) * track.width, y: track.y + track.height / 2 })
  await a.move(at(6))
  await a.wait(200)
  await a.drag(at(11), (p) => {
    const v = Math.round(MIN + ((p.x - track.x) / track.width) * (MAX - MIN))
    a.put({ size: Math.max(MIN, Math.min(MAX, v)) })
  }, { path: rail })
  await a.wait(1600)
  await a.drag(at(6), (p) => {
    const v = Math.round(MIN + ((p.x - track.x) / track.width) * (MAX - MIN))
    a.put({ size: Math.max(MIN, Math.min(MAX, v)) })
  }, { path: rail })
  await a.move({ x: 320, y: 285 })
  await a.wait(1600)
}

export function StudioStage() {
  const image = useGarden()
  return (
    <Stage<StudioS>
      width={400}
      height={300}
      {...look}
      initial={{ size: 6 }}
      poster={{ size: 9 }}
      script={studioScript}
      cursor={{ at: { x: 320, y: 285 } }}
      className="st st-studio"
    >
      {(s) => {
        const pct = ((s.size - MIN) / (MAX - MIN)) * 100
        return (
          <Window title="Studio" className="st-studio-win">
            <div className="st-studio-body">
              <div className="st-studio-preview ss-live">
                <AsciiCanvas
                  source={image}
                  fontSize={s.size}
                  color="source"
                  backdrop={0.25}
                  brightness={0.2}
                  contrast={1.2}
                  gamma={0.7}
                  className="st-studio-canvas"
                  aria-hidden
                />
              </div>
              <div className="st-slider">
                <div className="st-slider-head">
                  <span>Cell size</span>
                  <span className="st-slider-value">{s.size}</span>
                </div>
                <div className="st-slider-track" data-target="track">
                  <span className="st-slider-fill" style={{ width: `${pct}%` }} />
                  <span className="st-slider-thumb" data-target="thumb" data-cursor="pointer" style={{ left: `${pct}%` }} />
                </div>
              </div>
            </div>
          </Window>
        )
      }}
    </Stage>
  )
}

/* ------------------------------------------------------------------ */
/* Source: the file lands in your tree and its code is yours.         */
/* ------------------------------------------------------------------ */

const CODE = [
  '"use client"',
  "",
  'import { AsciiCanvas } from "@/lib/ascii"',
  "",
  "export function AsciiDonut({ speed = 1, ...props }) {",
  "  const frame = (f, t, s) => {",
  "    const A = t * speed",
  "    const B = t * speed * 0.5",
  "    // lit and z-buffered on the grid",
]

type SourceS = { file: boolean; lines: number }

async function sourceScript(a: Act<SourceS>) {
  await a.wait(900)
  await a.set({ file: true })
  await a.wait(500)
  for (let i = 1; i <= CODE.length; i++) {
    a.put({ lines: i })
    await a.wait(110)
  }
  await a.wait(3200)
  await a.set({ file: false, lines: 0 })
  await a.wait(800)
}

function TreeRow({ depth, name, folder, active }: { depth: number; name?: string; folder?: boolean; active?: boolean }) {
  return (
    <div className="st-tree-row" data-active={active || undefined} style={{ paddingLeft: 10 + depth * 12 }}>
      <span className="st-tree-glyph">{folder ? "▾" : ""}</span>
      {name ? <span className="st-tree-name">{name}</span> : <Bar w={64} h={6} r={3} tone={2} />}
    </div>
  )
}

export function SourceStage() {
  return (
    <Stage<SourceS>
      width={400}
      height={300}
      {...look}
      initial={{ file: false, lines: 0 }}
      poster={{ file: true, lines: CODE.length }}
      script={sourceScript}
      className="st st-source"
    >
      {(s) => (
        <Window
          className="st-source-win"
          sidebarWidth={150}
          sidebar={
            <div className="st-tree">
              <TreeRow depth={0} name="components" folder />
              <TreeRow depth={1} name="ui" folder />
              <TreeRow depth={2} />
              <TreeRow depth={2} />
              <Collapse open={s.file}>
                <TreeRow depth={2} name="ascii-donut.tsx" active />
              </Collapse>
              <TreeRow depth={0} name="lib" folder />
              <TreeRow depth={1} name="ascii" folder />
              <TreeRow depth={2} />
            </div>
          }
        >
          <div className="st-source-body">
            <div className="st-source-tab" data-on={s.file || undefined}>
              ascii-donut.tsx
            </div>
            <Code lines={CODE} count={s.lines} className="st-code" />
          </div>
        </Window>
      )}
    </Stage>
  )
}
