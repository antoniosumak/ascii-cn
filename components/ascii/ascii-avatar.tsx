import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/** FNV-1a, 32-bit. Stable across runtimes, so server and client draw the same face. */
export function hashString(s: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193)
  return h >>> 0
}

/** A `cols × rows` grid of filled cells, mirrored left to right and seeded by the string. */
export function identicon(seed: string, cols = 5, rows = cols) {
  let state = hashString(seed)
  // mulberry32: a tiny PRNG so neighbouring seeds give unrelated patterns.
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const half = Math.ceil(cols / 2)
  return Array.from({ length: rows }, () => {
    const left = Array.from({ length: half }, () => next() < 0.5)
    return [...left, ...left.slice(0, cols - half).reverse()]
  })
}

const quadrants = " ▘▝▀▖▌▞▛▗▚▐▜▄▙▟█"

export type AvatarVariant = "blocks" | "half" | "quadrants"

/**
 * The avatar as lines of text. A character cell is about 0.6 wide by 1 tall, so each variant
 * picks a grid that comes out roughly square: `blocks` spends two characters per cell, `half`
 * stacks two cells per character, `quadrants` packs 2×2.
 */
export function avatarLines(seed: string, size = 5, variant: AvatarVariant = "blocks") {
  if (variant === "blocks") return identicon(seed, size).map((row) => row.map((on) => (on ? "██" : "  ")).join(""))
  if (variant === "half") {
    const grid = identicon(seed, size)
    const out: string[] = []
    for (let y = 0; y < size; y += 2) {
      out.push(grid[y].map((top, x) => (top ? (grid[y + 1]?.[x] ? "█" : "▀") : grid[y + 1]?.[x] ? "▄" : " ")).join(""))
    }
    return out
  }
  const lines = Math.max(1, Math.round(size * 0.6))
  const grid = identicon(seed, size * 2, lines * 2)
  return Array.from({ length: lines }, (_, l) =>
    Array.from({ length: size }, (_, c) => {
      const at = (dx: number, dy: number) => (grid[l * 2 + dy][c * 2 + dx] ? 1 : 0)
      return quadrants[at(0, 0) | (at(1, 0) << 1) | (at(0, 1) << 2) | (at(1, 1) << 3)]
    }).join(""),
  )
}

export type AsciiAvatarProps = Omit<ComponentProps<"div">, "children"> & {
  /** Any string: a name, email or id. Also the accessible name. */
  name: string
  /** Cells across. */
  size?: number
  variant?: AvatarVariant
  /** Tint with a hue from the hash. Off uses the CSS `color`. */
  colored?: boolean
}

export function AsciiAvatar({ name, size = 5, variant = "blocks", colored = true, className, style, ...props }: AsciiAvatarProps) {
  return (
    <div
      role="img"
      aria-label={name}
      className={cn("inline-flex flex-col font-mono leading-none tracking-[-0.02em] whitespace-pre select-none", className)}
      style={colored ? { color: `oklch(0.68 0.16 ${hashString(name) % 360})`, ...style } : style}
      {...props}
    >
      {avatarLines(name, size, variant).map((line, i) => (
        // Block glyphs are taller than 1em, so each row is clipped to its line or it would cover the row below.
        <span key={i} aria-hidden className="overflow-hidden">
          {/* Blanks are invisible blocks: block glyphs often come from a fallback font whose width differs from a space. */}
          {line.match(/ +|[^ ]+/g)?.map((run, j) =>
            run[0] === " " ? (
              <span key={j} className="invisible">
                {"█".repeat(run.length)}
              </span>
            ) : (
              run
            ),
          )}
        </span>
      ))}
    </div>
  )
}
