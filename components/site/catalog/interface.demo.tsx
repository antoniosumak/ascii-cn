"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

import { AsciiAvatar, avatarLines, type AvatarVariant } from "@/components/ascii/ascii-avatar"
import { AsciiBox } from "@/components/ascii/ascii-box"
import { AsciiButton } from "@/components/ascii/ascii-button"
import { AsciiDivider, dividers } from "@/components/ascii/ascii-divider"
import { AsciiProgress } from "@/components/ascii/ascii-progress"
import { AsciiSkeleton } from "@/components/ascii/ascii-skeleton"
import { AsciiSpinner, spinners } from "@/components/ascii/ascii-spinner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

import { attr, imports, jsx, lines } from "./code"
import type { Demo, Values } from "./types"

type ProgressVariant = "blocks" | "shade" | "hash" | "arrow" | "dots"
type SpinnerVariant = keyof typeof spinners
type BoxVariant = "single" | "double" | "round" | "heavy" | "ascii"
type ButtonVariant = "brackets" | "box" | "arrow" | "underline"
type ButtonSize = "sm" | "default" | "lg"
type DividerVariant = keyof typeof dividers
type DividerAlign = "start" | "center" | "end"

const team = [
  { name: "Ada Lovelace", email: "ada@lovelace.dev", role: "Owner" },
  { name: "Grace Hopper", email: "grace@cobol.org", role: "Admin" },
  { name: "Alan Turing", email: "alan@bletchley.uk", role: "Member" },
  { name: "Katherine Johnson", email: "kj@nasa.gov", role: "Member" },
]

/** Font size that makes an avatar about `px` tall. Multiples of 5 put Geist Mono's 0.6em cells on whole pixels, which avoids hairline seams. */
function avatarFont(size: number, variant: AvatarVariant, px: number) {
  return Math.max(5, Math.round(px / avatarLines("", size, variant).length / 5) * 5)
}

const phone = "(max-width: 639px)"
/** True below the `sm` breakpoint, where a bar in characters has to be capped to fit. */
function useNarrow() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = matchMedia(phone)
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    },
    () => matchMedia(phone).matches,
    () => false,
  )
}

/** Loops 0 to 100 while `on`, otherwise holds `value`. */
function useLoop(value: number, on: boolean) {
  const [v, setV] = useState(value)
  useEffect(() => {
    if (!on || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => setV((n) => (n >= 100 ? 0 : n + 0.6)), 50)
    return () => clearInterval(id)
  }, [on])
  return on ? v : value
}

function ProgressPreview({ values: v }: { values: Values }) {
  const value = useLoop(v.value as number, v.animate as boolean)
  const width = useNarrow() ? Math.min(v.width as number, 14) : (v.width as number)
  const files = [
    { name: "assets.zip", at: value },
    { name: "fonts.woff2", at: Math.min(100, value * 1.6) },
    { name: "video.mp4", at: value * 0.45 },
  ]
  return (
    <div className="w-full max-w-lg p-4 sm:p-10">
      <div className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="text-sm font-medium text-foreground">Uploading 3 files</p>
          <p className="font-mono text-xs text-muted-foreground">{files.filter((f) => f.at >= 100).length}/3 done</p>
        </div>
        <div className="flex flex-col gap-1.5 overflow-hidden text-xs sm:text-sm">
          {files.map((f) => (
            <AsciiProgress
              key={f.name}
              value={f.at}
              variant={v.variant as ProgressVariant}
              width={width}
              label={f.name.padEnd(11)}
              className="[&>span:nth-child(2)]:text-primary"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function VariantsExample() {
  const value = useLoop(42, true)
  return (
    <div className="flex flex-col gap-2 p-4 text-xs sm:p-8 sm:text-sm">
      {(["blocks", "shade", "hash", "arrow", "dots"] as const).map((variant) => (
        <AsciiProgress key={variant} value={value} variant={variant} width={variant === "dots" ? 12 : 24} label={variant.padEnd(6)} />
      ))}
    </div>
  )
}

function BoxPanel({ variant, title }: { variant: BoxVariant; title: string }) {
  return (
    <div className="grid w-full max-w-xl gap-4 p-6 text-sm sm:grid-cols-2 sm:p-10">
      <AsciiBox title={title} variant={variant} className="text-muted-foreground">
        <p className="text-foreground">All systems normal.</p>
        <AsciiProgress value={73} width={12} label="cpu" className="mt-2 [&>span:nth-child(2)]:text-primary" />
      </AsciiBox>
      <AsciiBox title="deploy" variant={variant} className="text-primary">
        <p className="flex items-center gap-2 text-foreground">
          <AsciiSpinner className="text-primary" /> Building…
        </p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">main · 4f2a91c</p>
      </AsciiBox>
    </div>
  )
}

function ButtonPreview({ values: v }: { values: Values }) {
  const size = v.size as ButtonSize
  return (
    <div className="w-full max-w-md p-4 sm:p-10">
      <div className="rounded-xl border bg-card p-4 sm:p-5">
        <p className="text-sm font-medium text-foreground">Ship to production?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Build <span className="font-mono text-foreground">4f2a91c</span> passed every check and will replace the live
          version.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" size={size}>
            Cancel
          </Button>
          <AsciiButton
            variant={v.variant as ButtonVariant}
            size={size}
            disabled={v.disabled as boolean}
            className="text-primary"
          >
            {(v.label as string) || "Deploy"}
          </AsciiButton>
        </div>
      </div>
    </div>
  )
}

function SkeletonPreview({ values: v }: { values: Values }) {
  const loading = v.loading as boolean
  const posts = [
    { ...team[1], text: "Merged the compiler pass. Builds are 30% faster on cold cache, numbers in the thread." },
    { ...team[2], text: "Can someone review the cipher PR before Friday? It touches the key schedule." },
    { ...team[3], text: "Trajectory checks are green for the next launch window." },
  ]
  return (
    <div className="w-full max-w-md p-4 sm:p-10">
      <div aria-busy={loading} className="flex flex-col divide-y rounded-xl border bg-card">
        {posts.map((p) => (
          <div key={p.email} className="flex gap-3 p-4">
            {loading ? (
              <AsciiSkeleton variant="avatar" className="text-[16px] text-muted-foreground/60" />
            ) : (
              <AsciiAvatar name={p.email} aria-label={p.name} variant="half" className="text-[10px]" />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
              {loading ? (
                <>
                  <AsciiSkeleton lines={1} width={14} className="text-xs text-muted-foreground/80" />
                  <AsciiSkeleton lines={v.lines as number} className="text-xs text-muted-foreground/60" />
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-foreground">{p.name}</p>
                  <p className="line-clamp-3 text-xs text-muted-foreground">{p.text}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AvatarPreview({ values: v }: { values: Values }) {
  const variant = v.variant as AvatarVariant
  const size = v.size as number
  const name = (v.name as string) || " "
  const tone = v.colored ? undefined : "text-foreground"
  return (
    <div className="w-full max-w-md p-4 sm:p-10">
      <div className="rounded-xl border bg-card">
        <div className="flex items-center gap-4 p-5">
          <AsciiAvatar
            name={name}
            variant={variant}
            size={size}
            colored={v.colored as boolean}
            className={tone}
            style={{ fontSize: avatarFont(size, variant, 56) }}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <p className="font-mono text-xs text-muted-foreground">Your identicon</p>
          </div>
        </div>
        <ul className="flex flex-col border-t p-2">
          {team.map((m) => (
            <li key={m.email} className="flex items-center gap-3 rounded-md px-3 py-2">
              <AsciiAvatar
                name={m.email}
                aria-label={m.name}
                variant={variant}
                size={size}
                colored={v.colored as boolean}
                className={tone}
                style={{ fontSize: avatarFont(size, variant, 28) }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{m.name}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">{m.email}</p>
              </div>
              <span className="text-xs text-muted-foreground">{m.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function DividerPreview({ values: v }: { values: Values }) {
  const rule = (label: string | undefined, className = "") => (
    <AsciiDivider
      variant={v.variant as DividerVariant}
      align={v.align as DividerAlign}
      label={label}
      className={cn("mt-5 mb-3 text-xs text-muted-foreground first:mt-0", className)}
    />
  )
  const row = "flex items-center justify-between gap-4 py-1.5 text-sm"
  return (
    <div className="w-full max-w-md p-4 sm:p-10">
      <div className="rounded-xl border bg-card p-4 sm:p-5">
        {rule((v.label as string) || undefined)}
        <div className={row}>
          <span className="text-muted-foreground">Display name</span>
          <span className="text-foreground">Ada Lovelace</span>
        </div>
        <div className={row}>
          <span className="text-muted-foreground">Email</span>
          <span className="font-mono text-xs text-foreground">ada@lovelace.dev</span>
        </div>
        {rule("notifications")}
        <label className={row}>
          <span className="text-muted-foreground">Deploy alerts</span>
          <Switch defaultChecked />
        </label>
        <label className={row}>
          <span className="text-muted-foreground">Weekly digest</span>
          <Switch />
        </label>
        {rule("danger zone", "text-destructive/70")}
        <div className={row}>
          <span className="text-muted-foreground">Delete this project</span>
          <AsciiButton size="sm" className="text-destructive">
            Delete
          </AsciiButton>
        </div>
      </div>
    </div>
  )
}

export const interfaceDemos: Record<string, Demo> = {
  "ascii-progress": {
    controls: [
      { prop: "variant", type: "select", options: ["blocks", "shade", "hash", "arrow", "dots"], default: "blocks" },
      { prop: "width", type: "range", min: 8, max: 32, default: 20, base: 24 },
      { prop: "value", type: "range", min: 0, max: 100, default: 64 },
      { prop: "animate", label: "loop", type: "boolean", default: true },
    ],
    Preview: ProgressPreview,
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-progress", "AsciiProgress"),
        "",
        jsx("AsciiProgress", [
          `value={${Math.round(v.value as number)}}`,
          attr("variant", v.variant, "blocks"),
          attr("width", v.width, 24),
          'label="assets.zip"',
        ]),
      ),
    examples: { variants: VariantsExample },
    Thumb: () => (
      <div className="flex flex-col gap-1.5 text-xs">
        <AsciiProgress value={72} width={18} label="upload" />
        <AsciiProgress value={38} width={18} variant="shade" label="index " />
        <AsciiProgress value={90} width={18} variant="arrow" label="build " />
      </div>
    ),
  },
  "ascii-spinner": {
    controls: [
      { prop: "variant", type: "select", options: Object.keys(spinners), default: "braille" },
      { prop: "label", type: "text", default: "Deploying", base: "Loading", maxLength: 20 },
    ],
    Preview: ({ values: v }) => (
      <div className="flex flex-col items-center gap-6 p-10">
        <Button disabled className="gap-2 font-mono">
          <AsciiSpinner variant={v.variant as SpinnerVariant} label={v.label as string} className="w-[2ch]" />
          {v.label as string}…
        </Button>
        <div className="flex flex-col gap-1 font-mono text-sm">
          <p className="flex gap-3">
            <span className="w-[2ch] text-primary">✓</span>
            <span className="text-muted-foreground">install dependencies</span>
          </p>
          <p className="flex gap-3">
            <AsciiSpinner variant={v.variant as SpinnerVariant} label="Building" className="w-[2ch] text-primary" />
            <span className="text-foreground">build</span>
          </p>
          <p className="flex gap-3">
            <span className="w-[2ch] text-muted-foreground/50">·</span>
            <span className="text-muted-foreground/50">deploy</span>
          </p>
        </div>
      </div>
    ),
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-spinner", "AsciiSpinner"),
        "",
        jsx(
          "Button",
          ["disabled"],
          `${jsx("AsciiSpinner", [attr("variant", v.variant, "braille"), attr("label", v.label, "Loading")])}\n${v.label}…`,
        ),
      ),
    examples: {
      all: () => (
        <div className="grid grid-cols-2 gap-x-10 gap-y-2 p-8 text-sm sm:grid-cols-3">
          {(Object.keys(spinners) as SpinnerVariant[]).map((v) => (
            <div key={v} className="flex items-center gap-3">
              <AsciiSpinner variant={v} className="w-[2ch] text-primary" />
              <span className="font-mono text-muted-foreground">{v}</span>
            </div>
          ))}
        </div>
      ),
    },
    Thumb: () => (
      <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-lg">
        {(Object.keys(spinners) as SpinnerVariant[]).slice(0, 6).map((v) => (
          <AsciiSpinner key={v} variant={v} className="w-[2ch] text-primary" />
        ))}
      </div>
    ),
  },
  "ascii-box": {
    controls: [
      { prop: "variant", type: "select", options: ["single", "double", "round", "heavy", "ascii"], default: "round", base: "single" },
      { prop: "title", type: "text", default: "status", maxLength: 16 },
    ],
    Preview: ({ values: v }) => <BoxPanel variant={v.variant as BoxVariant} title={v.title as string} />,
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-box", "AsciiBox"),
        "",
        jsx(
          "AsciiBox",
          [attr("title", v.title), attr("variant", v.variant, "single"), 'className="text-muted-foreground"'],
          '<p className="text-foreground">All systems normal.</p>',
        ),
      ),
    examples: {
      borders: () => (
        <div className="grid w-full grid-cols-2 gap-4 p-8 text-sm sm:grid-cols-3">
          {(["single", "double", "round", "heavy", "ascii"] as const).map((v) => (
            <AsciiBox key={v} variant={v} title={v} className="text-muted-foreground">
              <span className="text-foreground">ok</span>
            </AsciiBox>
          ))}
        </div>
      ),
    },
    Thumb: () => (
      <AsciiBox title="status" variant="round" className="w-56 text-xs text-muted-foreground">
        <p className="text-foreground">All systems normal.</p>
      </AsciiBox>
    ),
  },
  "ascii-button": {
    controls: [
      { prop: "variant", type: "select", options: ["brackets", "box", "arrow", "underline"], default: "brackets" },
      { prop: "size", type: "select", options: ["sm", "default", "lg"], default: "default" },
      { prop: "label", type: "text", default: "Deploy", maxLength: 16 },
      { prop: "disabled", type: "boolean", default: false },
    ],
    Preview: ButtonPreview,
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-button", "AsciiButton"),
        imports("@/components/ui/button", "Button"),
        "",
        jsx("Button", ['variant="outline"', attr("size", v.size, "default")], "Cancel"),
        jsx(
          "AsciiButton",
          [attr("variant", v.variant, "brackets"), attr("size", v.size, "default"), attr("disabled", v.disabled, false), 'className="text-primary"'],
          (v.label as string) || "Deploy",
        ),
      ),
    examples: {
      variants: () => (
        <div className="flex flex-wrap items-center justify-center gap-4 p-8">
          <AsciiButton variant="brackets">Deploy</AsciiButton>
          <AsciiButton variant="box">Deploy</AsciiButton>
          <AsciiButton variant="arrow">deploy</AsciiButton>
          <AsciiButton variant="underline">Deploy</AsciiButton>
        </div>
      ),
      shadcn: () => (
        <div className="flex flex-col items-center gap-4 p-4 sm:p-8">
          {(["sm", "default", "lg"] as const).map((size) => (
            <div key={size} className="flex items-center gap-2">
              <Button variant="outline" size={size}>
                Cancel
              </Button>
              <AsciiButton size={size} disabled>
                Revert
              </AsciiButton>
              <AsciiButton size={size} className="text-primary">
                Deploy
              </AsciiButton>
            </div>
          ))}
        </div>
      ),
    },
    Thumb: () => (
      <div className="flex flex-col items-center gap-3">
        <AsciiButton className="text-primary">Deploy</AsciiButton>
        <AsciiButton variant="box">Run tests</AsciiButton>
        <AsciiButton variant="arrow" className="text-muted-foreground">
          rollback
        </AsciiButton>
      </div>
    ),
  },
  "ascii-skeleton": {
    controls: [
      { prop: "lines", type: "range", min: 1, max: 4, default: 2, base: 3 },
      { prop: "loading", type: "boolean", default: true },
    ],
    Preview: SkeletonPreview,
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-skeleton", "AsciiSkeleton"),
        "",
        jsx(
          "div",
          ['aria-busy="true"', 'className="flex gap-3 text-muted-foreground/60"'],
          lines(
            jsx("AsciiSkeleton", ['variant="avatar"']),
            jsx(
              "div",
              ['className="flex flex-1 flex-col gap-2"'],
              lines(jsx("AsciiSkeleton", ["lines={1}", "width={14}"]), jsx("AsciiSkeleton", [attr("lines", v.lines, 3)])),
            ),
          ),
        ),
      ),
    examples: {
      feed: () => (
        <div aria-busy="true" className="flex w-full max-w-sm gap-3 p-8 text-sm text-muted-foreground/60">
          <AsciiSkeleton variant="avatar" />
          <div className="flex flex-1 flex-col gap-2">
            <AsciiSkeleton lines={1} width={14} />
            <AsciiSkeleton lines={2} />
          </div>
        </div>
      ),
    },
    Thumb: () => (
      <div className="flex w-56 gap-3 text-xs text-muted-foreground/60">
        <AsciiSkeleton variant="avatar" className="text-base" />
        <div className="flex flex-1 flex-col gap-2">
          <AsciiSkeleton lines={1} width={10} />
          <AsciiSkeleton lines={3} />
        </div>
      </div>
    ),
  },
  "ascii-avatar": {
    controls: [
      { prop: "name", type: "text", default: "ada@lovelace.dev", maxLength: 32 },
      { prop: "variant", type: "select", options: ["blocks", "half", "quadrants"], default: "blocks" },
      { prop: "size", type: "range", min: 3, max: 9, default: 5 },
      { prop: "colored", type: "boolean", default: true },
    ],
    Preview: AvatarPreview,
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-avatar", "AsciiAvatar"),
        "",
        jsx("AsciiAvatar", [
          attr("name", v.name),
          attr("variant", v.variant, "blocks"),
          attr("size", v.size, 5),
          attr("colored", v.colored, true),
          `className="text-[${avatarFont(v.size as number, v.variant as AvatarVariant, 56)}px]"`,
        ]),
      ),
    examples: {
      variants: () => (
        <div className="flex flex-wrap items-end justify-center gap-10 p-8">
          {(["blocks", "half", "quadrants"] as const).map((variant) => (
            <div key={variant} className="flex flex-col items-center gap-3">
              <AsciiAvatar name="ada@lovelace.dev" variant={variant} size={7} style={{ fontSize: avatarFont(7, variant, 64) }} />
              <span className="font-mono text-xs text-muted-foreground">{variant}</span>
            </div>
          ))}
        </div>
      ),
      pure: () => (
        <div className="flex flex-wrap justify-center gap-8 p-8">
          {team.slice(0, 3).map((m) => (
            <pre key={m.email} className="font-mono text-sm leading-none text-primary">
              {avatarLines(m.email, 5, "half").join("\n")}
            </pre>
          ))}
        </div>
      ),
    },
    Thumb: () => (
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        {[...team, { email: "linus@kernel.org" }, { email: "margaret@apollo.mit" }].map((m) => (
          <AsciiAvatar key={m.email} name={m.email} className="text-[5px]" />
        ))}
      </div>
    ),
  },
  "ascii-divider": {
    controls: [
      { prop: "variant", type: "select", options: Object.keys(dividers), default: "single" },
      { prop: "label", type: "text", default: "account", maxLength: 20 },
      { prop: "align", type: "select", options: ["start", "center", "end"], default: "start", base: "center" },
    ],
    Preview: DividerPreview,
    code: (v) =>
      lines(
        imports("@/components/ascii/ascii-divider", "AsciiDivider"),
        "",
        jsx("AsciiDivider", [
          attr("variant", v.variant, "single"),
          v.label !== "" && attr("label", v.label),
          attr("align", v.align, "center"),
          'className="text-muted-foreground"',
        ]),
      ),
    examples: {
      patterns: () => (
        <div className="grid w-full grid-cols-1 gap-x-8 gap-y-3 p-8 text-xs text-muted-foreground sm:grid-cols-2">
          {(Object.keys(dividers) as DividerVariant[]).map((v) => (
            <AsciiDivider key={v} variant={v} label={<span className="text-foreground">{v}</span>} aria-label={v} />
          ))}
        </div>
      ),
    },
    Thumb: () => (
      <div className="flex w-56 flex-col gap-3 text-xs text-muted-foreground">
        <AsciiDivider label={<span className="text-foreground">settings</span>} align="start" />
        <AsciiDivider variant="beads" />
        <AsciiDivider variant="double" label="or" />
        <AsciiDivider variant="wave" className="text-primary" />
      </div>
    ),
  },
}
