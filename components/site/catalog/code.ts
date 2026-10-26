import type { Value } from "./types"

/** One JSX attribute, or nothing when the value equals the component default. */
export function attr(name: string, value: Value, base?: Value) {
  if (value === base) return null
  if (typeof value === "string") return `${name}="${value}"`
  return value === true ? name : `${name}={${value}}`
}

export const indent = (code: string, by = "  ") =>
  code
    .split("\n")
    .map((l) => (l ? by + l : l))
    .join("\n")

/** A JSX element, attributes on one line when they fit. Nest by passing another `jsx()` as children. */
export function jsx(tag: string, attrs: (string | null | false | undefined)[], children?: string) {
  const a = attrs.filter(Boolean) as string[]
  const line = `<${tag}${a.map((x) => ` ${x}`).join("")}`
  const multiline = line.length > 70 || line.includes("\n")
  const open = multiline ? `<${tag}\n${a.map((x) => indent(x)).join("\n")}\n` : line
  if (children === undefined) return open + (multiline ? "/>" : " />")
  return `${open}>\n${indent(children)}\n</${tag}>`
}

export const imports = (from: string, ...names: string[]) => `import { ${names.join(", ")} } from "${from}"`

/** Joins lines of a snippet, dropping falsy parts but keeping blank lines. */
export const lines = (...parts: (string | false | null | undefined)[]) =>
  parts.filter((p) => typeof p === "string").join("\n")
