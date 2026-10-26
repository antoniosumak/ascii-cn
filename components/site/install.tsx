"use client"

import { useSyncExternalStore } from "react"

import { CodeBlock } from "@/components/site/code-block"
import { cn } from "@/lib/utils"

export const managers = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
}
export type Manager = keyof typeof managers

// One choice shared by every install block on the site, remembered per browser.
const KEY = "package-manager"
const listeners = new Set<() => void>()
const read = (): Manager => {
  try {
    const v = localStorage.getItem(KEY)
    return v && v in managers ? (v as Manager) : "pnpm"
  } catch {
    return "pnpm"
  }
}
export const chooseManager = (m: Manager) => {
  try {
    localStorage.setItem(KEY, m)
  } catch {}
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => (listeners.add(l), () => listeners.delete(l))

export const useManager = () => useSyncExternalStore(subscribe, read, () => "pnpm" as Manager)

export function InstallCommand({
  items,
  cli = "shadcn@latest add",
  className,
}: {
  items: string
  cli?: string
  className?: string
}) {
  const manager = useManager()
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-muted/40", className)}>
      <div role="tablist" aria-label="Package manager" className="flex gap-1 border-b px-2 py-1.5">
        {(Object.keys(managers) as Manager[]).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={m === manager}
            onClick={() => chooseManager(m)}
            className="rounded-md px-2 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground aria-selected:bg-background aria-selected:text-foreground dark:aria-selected:bg-input/40"
          >
            {m}
          </button>
        ))}
      </div>
      <CodeBlock code={`${managers[manager]} ${cli} ${items}`} className="rounded-none border-0 bg-transparent" />
    </div>
  )
}
