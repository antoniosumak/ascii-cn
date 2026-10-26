import { Fragment, type ReactNode } from "react"

import type { Prop } from "@/components/site/catalog/types"
import { cn } from "@/lib/utils"

/** Renders `backtick` spans in a docs string as inline code. */
export function Inline({ text }: { text: string }) {
  return text.split("`").map((part, i) => (i % 2 ? <code key={i}>{part}</code> : <Fragment key={i}>{part}</Fragment>))
}

export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "prose flex max-w-3xl flex-col gap-4 text-[15px] leading-7 text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function PropsTable({ props }: { props: Prop[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/40 font-mono text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Prop</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Default</th>
            <th className="px-3 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map(([name, type, def, desc]) => (
            <tr key={name} className="border-b align-top last:border-0">
              <td className="px-3 py-2 font-mono text-[13px] text-primary">{name}</td>
              <td className="px-3 py-2 font-mono text-[12px] text-muted-foreground">{type}</td>
              <td className="px-3 py-2 font-mono text-[12px] whitespace-nowrap text-muted-foreground">{def}</td>
              <td className="min-w-48 px-3 py-2 text-muted-foreground">
                <Inline text={desc} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
