import type { ComponentType } from "react"

export type Prop = [name: string, type: string, defaultValue: string, description: string]

/** Server-safe docs content for one component. Strings may use `backticks` for inline code. */
export type Meta = {
  usage: string
  props?: Prop[]
  /** Also accepts every AsciiCanvas prop. */
  inherits?: boolean
  examples?: { id: string; title: string; description: string; code: string }[]
  notes?: [label: string, text: string][]
}

export type Value = string | number | boolean
export type Values = Record<string, Value>

type Base<T extends Value> = {
  prop: string
  label?: string
  /** Value the demo starts with. */
  default: T
  /** The component's own default, so generated code can leave the prop out. Falls back to `default`. */
  base?: T
}

export type Control =
  | (Base<string> & { type: "select"; options: readonly string[] })
  | (Base<string> & { type: "swatch"; options: Record<string, string> })
  | (Base<number> & { type: "range"; min: number; max: number; step?: number })
  | (Base<boolean> & { type: "boolean" })
  | (Base<string> & { type: "text"; maxLength?: number })

/** Client-side demos for one component. */
export type Demo = {
  controls?: Control[]
  /** The hero preview, ideally shown in a realistic setting. Receives the current control values. */
  Preview: ComponentType<{ values: Values }>
  /** Code for the Code tab, kept in sync with the controls. Falls back to the usage snippet. */
  code?: (values: Values) => string
  /** One per `Meta.examples` id. */
  examples?: Record<string, ComponentType>
  /** Catalog thumbnail. Falls back to `Preview` with default values. */
  Thumb?: ComponentType
}
