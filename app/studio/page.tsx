import type { Metadata } from "next"

import { Studio } from "./studio"

export const metadata: Metadata = {
  title: "Studio",
  description: "Turn images, video and your webcam into ASCII. Export text, SVG or PNG, or copy the component.",
}

export default function StudioPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-mono text-3xl font-semibold tracking-tight">Studio</h1>
        <p className="text-muted-foreground">
          Images, video or your camera in, ASCII out. Tune it, export it, or copy it as a component.
        </p>
      </div>
      <Studio />
    </main>
  )
}
