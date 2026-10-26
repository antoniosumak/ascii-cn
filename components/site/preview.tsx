"use client"

import { Maximize2Icon, RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react"
import { useRef, useState, type ReactNode } from "react"

import { demos } from "@/components/site/catalog/demos"
import { CodeBlock } from "@/components/site/code-block"
import { Controls, initialValues } from "@/components/site/controls"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

function ToolButton({ children, className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none aria-pressed:text-foreground [&_svg]:size-3.5",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function PreviewFrame({
  code,
  children,
  controls,
  height = "min-h-72",
}: {
  code: string
  children: ReactNode
  controls?: ReactNode
  height?: string
}) {
  const card = useRef<HTMLDivElement>(null)
  const [run, setRun] = useState(0)
  const [showControls, setShowControls] = useState(true)

  return (
    <Tabs defaultValue="preview" className="not-prose gap-3">
      <div className="flex items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="preview" className="px-3">
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="px-3">
            Code
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center">
          {controls && (
            <ToolButton aria-pressed={showControls} onClick={() => setShowControls((s) => !s)}>
              <SlidersHorizontalIcon /> <span className="max-sm:sr-only">Controls</span>
            </ToolButton>
          )}
          <ToolButton onClick={() => setRun((n) => n + 1)}>
            <RotateCcwIcon /> <span className="max-sm:sr-only">Replay</span>
          </ToolButton>
          <ToolButton onClick={() => (document.fullscreenElement ? document.exitFullscreen() : card.current?.requestFullscreen())}>
            <Maximize2Icon /> <span className="max-sm:sr-only">Expand</span>
          </ToolButton>
        </div>
      </div>
      <div ref={card} className="flex flex-col overflow-hidden rounded-xl border bg-card [&:fullscreen]:rounded-none [&:fullscreen]:border-0">
        <TabsContent value="preview" keepMounted className="flex flex-1 flex-col">
          <div key={run} className={cn("relative grid flex-1 place-items-center overflow-hidden text-foreground", height)}>
            {children}
          </div>
          {controls && showControls && controls}
        </TabsContent>
        <TabsContent value="code" className="flex-1">
          <CodeBlock code={code} className="max-h-[32rem] overflow-y-auto rounded-none border-0 bg-transparent" />
        </TabsContent>
      </div>
    </Tabs>
  )
}

export function ComponentPreview({ name, usage }: { name: string; usage: string }) {
  const demo = demos[name]
  const [values, setValues] = useState(() => initialValues(demo?.controls))
  if (!demo) return null
  const { Preview, controls, code } = demo
  return (
    <PreviewFrame
      code={code?.(values) ?? usage}
      controls={
        controls?.length ? (
          <Controls controls={controls} values={values} onChange={(prop, v) => setValues((s) => ({ ...s, [prop]: v }))} />
        ) : undefined
      }
    >
      <Preview values={values} />
    </PreviewFrame>
  )
}

export function ExamplePreview({ name, id, code }: { name: string; id: string; code: string }) {
  const Example = demos[name]?.examples?.[id]
  if (!Example) return null
  return (
    <PreviewFrame code={code} height="min-h-56">
      <Example />
    </PreviewFrame>
  )
}

export function Thumb({ name }: { name: string }) {
  const demo = demos[name]
  if (!demo) return null
  if (demo.Thumb) return <demo.Thumb />
  return <demo.Preview values={initialValues(demo.controls)} />
}
