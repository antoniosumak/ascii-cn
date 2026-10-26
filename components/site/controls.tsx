"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import type { Control, Value, Values } from "@/components/site/catalog/types"
import { cn } from "@/lib/utils"

const SEGMENTED_MAX = 5

function Segmented({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-lg bg-muted/60 p-0.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={o === value}
          onClick={() => onChange(o)}
          className={cn(
            "h-7 min-w-0 flex-1 truncate rounded-md px-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
            o === value && "bg-background text-foreground shadow-sm dark:bg-input/40",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function Widget({ control: c, value, onChange }: { control: Control; value: Value; onChange: (v: Value) => void }) {
  const label = c.label ?? c.prop
  switch (c.type) {
    case "select":
      return c.options.length <= SEGMENTED_MAX ? (
        <Segmented label={label} options={c.options} value={value as string} onChange={onChange} />
      ) : (
        <Select value={value as string} onValueChange={(v) => v && onChange(v)}>
          <SelectTrigger aria-label={label} className="h-8 w-full font-mono text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {c.options.map((o) => (
              <SelectItem key={o} value={o} className="font-mono text-xs">
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case "swatch":
      return (
        <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2 py-1">
          {Object.entries(c.options).map(([name, css]) => (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={name === value}
              aria-label={name}
              title={name}
              onClick={() => onChange(name)}
              style={{ background: css }}
              className="size-5 rounded-full ring-offset-2 ring-offset-card transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring aria-checked:ring-2 aria-checked:ring-foreground"
            />
          ))}
        </div>
      )
    case "range":
      return (
        <div className="flex h-8 items-center gap-3">
          <Slider
            aria-label={label}
            value={[value as number]}
            min={c.min}
            max={c.max}
            step={c.step ?? 1}
            onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
          />
          <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums">
            {Number((value as number).toFixed(2))}
          </span>
        </div>
      )
    case "boolean":
      return (
        <div className="flex h-8 items-center">
          <Switch aria-label={label} checked={value as boolean} onCheckedChange={onChange} />
        </div>
      )
    case "text":
      return (
        <input
          value={value as string}
          maxLength={c.maxLength}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-full rounded-md border bg-transparent px-2.5 font-mono text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      )
  }
}

export const initialValues = (controls: Control[] = []): Values =>
  Object.fromEntries(controls.map((c) => [c.prop, c.default]))

export function Controls({ controls, values, onChange }: { controls: Control[]; values: Values; onChange: (prop: string, v: Value) => void }) {
  return (
    <div className="border-t px-5 py-4">
      <p className="mb-3 font-mono text-[11px] font-medium tracking-widest text-foreground uppercase">Controls</p>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {controls.map((c) => (
          <div key={c.prop} className="flex min-w-0 flex-col gap-1.5">
            <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">{c.label ?? c.prop}</span>
            <Widget control={c} value={values[c.prop]} onChange={(v) => onChange(c.prop, v)} />
          </div>
        ))}
      </div>
    </div>
  )
}
