import type { Metadata } from "next"

import { AsciiDonut } from "@/components/ascii/ascii-donut"
import { CodeBlock } from "@/components/site/code-block"
import { Prose } from "@/components/site/docs"

export const metadata: Metadata = { title: "Theming" }

export default function ThemingPage() {
  return (
    <Prose>
      <h1>Theming</h1>
      <p>
        Every canvas reads its glyph colour from CSS <code>color</code>, so your Tailwind text utilities and shadcn tokens
        theme it. No props, no extra variables. When the theme class on <code>&lt;html&gt;</code> changes, canvases repaint.
      </p>
      <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-xl border p-2">
        <AsciiDonut className="h-36 text-primary" fontSize={8} />
        <AsciiDonut className="h-36 text-foreground" fontSize={8} />
        <AsciiDonut className="h-36 text-muted-foreground" fontSize={8} />
      </div>
      <CodeBlock
        code={`<AsciiDonut className="text-primary" />
<AsciiDonut className="text-foreground" />
<AsciiDonut className="text-muted-foreground" />
<AsciiBackground className="text-primary/40" />  // alpha works too`}
      />

      <h2>Light and dark</h2>
      <p>
        Photos flip automatically. With <code>ink=&quot;auto&quot;</code> (the default), light pixels become glyphs when the
        ink is light and dark pixels when it is dark, so a portrait reads correctly in both themes. Force it with{" "}
        <code>ink=&quot;light&quot;</code> or <code>ink=&quot;dark&quot;</code>.
      </p>

      <h2>Source colours</h2>
      <p>
        <code>color=&quot;source&quot;</code> paints each glyph with its sampled pixel instead of the theme colour.
      </p>

      <h2>Fonts</h2>
      <p>
        Glyphs use the canvas&apos;s computed <code>font-family</code>, <code>font-mono</code> by default. Swap it with a
        class, e.g. <code>className=&quot;font-[JetBrains_Mono]&quot;</code>. The grid is measured from the font, so any
        monospace face lines up.
      </p>
    </Prose>
  )
}
