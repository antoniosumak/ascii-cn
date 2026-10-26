"use client"

import { CameraIcon, CheckIcon, CopyIcon, DownloadIcon, UploadIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { AsciiImage } from "@/components/ascii/ascii-image"
import { AsciiVideo } from "@/components/ascii/ascii-video"
import { CodeBlock } from "@/components/site/code-block"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { charsets, palettes, type AsciiHandle, type CharsetName, type DitherMode } from "@/lib/ascii"
import { cn } from "@/lib/utils"

type Input = { kind: "image" | "video"; src: string; name: string } | { kind: "webcam" }

const defaults = {
  charset: "standard" as CharsetName,
  fontSize: 8,
  dither: "none" as DitherMode,
  brightness: 0,
  contrast: 1,
  gamma: 1,
  invert: false,
  backdrop: 0,
  edges: 0,
  color: "source" as "ink" | "source" | keyof typeof palettes,
}

type Settings = typeof defaults

const samples: { src: string; name: string; tune: Partial<Settings> }[] = [
  { src: "/demo/meadow.jpg", name: "meadow", tune: { backdrop: 0.5, brightness: 0.1, gamma: 0.75 } },
  { src: "/demo/cabin.jpg", name: "cabin", tune: { backdrop: 0.5, brightness: 0.12, gamma: 0.7 } },
  { src: "/demo/arcade.jpg", name: "arcade", tune: { backdrop: 0.55, brightness: 0, gamma: 0.9 } },
  { src: "/demo/garden.jpg", name: "garden", tune: { backdrop: 0.45, brightness: 0.05, gamma: 0.85 } },
]

const tuned = (sample: (typeof samples)[number]) => ({ ...defaults, ...sample.tune })

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      />
    </div>
  )
}

export function Studio() {
  const [input, setInput] = useState<Input>({ kind: "image", src: samples[0].src, name: samples[0].name })
  const [s, setS] = useState(() => tuned(samples[0]))
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const ascii = useRef<AsciiHandle>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const sample = input.kind === "image" ? samples.find((x) => x.src === input.src) : undefined
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }))

  // Object URLs from uploads are revoked when replaced.
  useEffect(() => {
    if (input.kind === "webcam" || !input.src.startsWith("blob:")) return
    return () => URL.revokeObjectURL(input.src)
  }, [input])

  const open = (file: File | undefined) => {
    if (!file) return
    const kind = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : null
    if (!kind) return setError("That file isn't an image or a video.")
    setError(null)
    setInput({ kind, src: URL.createObjectURL(file), name: file.name.replace(/\.[^.]+$/, "") })
  }

  const props = {
    ref: ascii,
    charset: s.charset,
    fontSize: s.fontSize,
    dither: s.dither,
    brightness: s.brightness,
    contrast: s.contrast,
    gamma: s.gamma,
    invert: s.invert,
    backdrop: s.backdrop,
    edges: s.edges,
    color: s.color === "ink" || s.color === "source" ? s.color : palettes[s.color],
    className: "text-primary",
  }

  const baseName = input.kind === "webcam" ? "webcam" : input.name
  const copyText = async () => {
    await navigator.clipboard.writeText(ascii.current?.text() ?? "")
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const changed = (Object.keys(defaults) as (keyof Settings)[]).filter((k) => s[k] !== defaults[k] && k !== "color")
  const jsxProps = [
    ...changed.map((k) => (typeof s[k] === "string" ? `${k}="${s[k]}"` : `${k}={${s[k]}}`)),
    ...(s.color === "ink" ? [] : [s.color === "source" ? 'color="source"' : `color={palettes.${s.color}}`]),
  ]
  const snippet =
    input.kind === "image"
      ? `<AsciiImage\n  src="${input.src.startsWith("blob:") ? "/your-image.jpg" : input.src}"\n  alt="…"\n${jsxProps.map((p) => `  ${p}\n`).join("")}/>`
      : `<AsciiVideo\n  src="${input.kind === "webcam" ? "webcam" : "/your-video.mp4"}"\n${jsxProps.map((p) => `  ${p}\n`).join("")}/>`

  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
      <aside className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs tracking-wide text-muted-foreground/70 uppercase">Input</p>
          <div className="grid grid-cols-4 gap-2">
            {samples.map((x) => (
              <button
                key={x.src}
                type="button"
                onClick={() => (setInput({ kind: "image", src: x.src, name: x.name }), setS(tuned(x)))}
                aria-label={`Use the ${x.name} sample`}
                aria-pressed={input.kind === "image" && input.src === x.src}
                className="aspect-square overflow-hidden rounded-md border outline-offset-2 aria-pressed:outline-2 aria-pressed:outline-primary"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- tiny local thumbnails */}
                <img src={x.src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => fileInput.current?.click()}>
              <UploadIcon /> Upload
            </Button>
            <Button
              variant={input.kind === "webcam" ? "default" : "outline"}
              onClick={() => (setError(null), setInput({ kind: "webcam" }))}
            >
              <CameraIcon /> Camera
            </Button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => open(e.target.files?.[0])}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex flex-col gap-5">
          <p className="font-mono text-xs tracking-wide text-muted-foreground/70 uppercase">Style</p>
          <div className="flex flex-col gap-2">
            <Label>Charset</Label>
            <Select value={s.charset} onValueChange={(v) => v && set("charset", v as CharsetName)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(charsets).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Colour</Label>
            <Select value={s.color} onValueChange={(v) => v && set("color", v as Settings["color"])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["ink", "source", ...Object.keys(palettes)].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Dither</Label>
            <Select value={s.dither} onValueChange={(v) => v && set("dither", v as DitherMode)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">none</SelectItem>
                <SelectItem value="bayer">bayer</SelectItem>
                <SelectItem value="floyd">floyd–steinberg</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Range label="Cell size" value={s.fontSize} min={4} max={24} step={1} onChange={(v) => set("fontSize", v)} />
          <Range label="Brightness" value={s.brightness} min={-0.5} max={0.5} step={0.01} onChange={(v) => set("brightness", v)} />
          <Range label="Contrast" value={s.contrast} min={0.5} max={3} step={0.05} onChange={(v) => set("contrast", v)} />
          <Range label="Gamma" value={s.gamma} min={0.3} max={2.5} step={0.05} onChange={(v) => set("gamma", v)} />
          <Range label="Edges" value={s.edges} min={0} max={1} step={0.05} onChange={(v) => set("edges", v)} />
          <Range label="Backdrop" value={s.backdrop} min={0} max={1} step={0.05} onChange={(v) => set("backdrop", v)} />
          <div className="flex items-center justify-between">
            <Label htmlFor="invert">Invert</Label>
            <Switch id="invert" checked={s.invert} onCheckedChange={(v) => set("invert", v)} />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setS(sample ? tuned(sample) : defaults)} className="self-start">
            Reset
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            open(e.dataTransfer.files[0])
          }}
          className={cn(
            "grid min-h-96 place-items-center rounded-xl border bg-muted/10 p-4 transition-colors",
            dragging && "border-primary bg-primary/5",
          )}
        >
          <div className="w-full max-w-3xl">
            {input.kind === "image" ? (
              <AsciiImage key={input.src} src={input.src} alt={`${input.name} as ASCII`} {...props} />
            ) : (
              <AsciiVideo
                key={input.kind === "webcam" ? "webcam" : input.src}
                src={input.kind === "webcam" ? "webcam" : input.src}
                aria-label="Video as ASCII"
                onError={(e) => setError(e instanceof Error ? e.message : "Couldn't start the video.")}
                {...props}
              />
            )}
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Drop an image or video anywhere on the preview. Everything runs in your browser.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={copyText}>
            {copied ? <CheckIcon /> : <CopyIcon />} {copied ? "Copied" : "Copy text"}
          </Button>
          <Button
            variant="outline"
            onClick={() => download(`${baseName}.txt`, new Blob([ascii.current?.text() ?? ""], { type: "text/plain" }))}
          >
            <DownloadIcon /> .txt
          </Button>
          <Button
            variant="outline"
            onClick={() => download(`${baseName}.svg`, new Blob([ascii.current?.svg() ?? ""], { type: "image/svg+xml" }))}
          >
            <DownloadIcon /> .svg
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              const png = await ascii.current?.png()
              if (png) download(`${baseName}.png`, png)
            }}
          >
            <DownloadIcon /> .png
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs tracking-wide text-muted-foreground/70 uppercase">As a component</p>
          <CodeBlock code={snippet} />
        </div>
      </div>
    </div>
  )
}
