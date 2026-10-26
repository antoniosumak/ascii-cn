import type { Metadata } from "next"
import Link from "next/link"

import { AsciiBackground } from "@/components/ascii/ascii-background"
import { Prose } from "@/components/site/docs"

export const metadata: Metadata = { title: "Introduction" }

export default function DocsIntro() {
  return (
    <Prose>
      <h1>Introduction</h1>
      <p className="text-base">
        asciicn is an ASCII engine plus a catalogue of components for React and shadcn/ui. Photos, video, animated
        backgrounds, display type and terminal-style UI, all drawn in characters and coloured by your theme.
      </p>
      <div className="h-40 overflow-hidden rounded-xl border">
        <AsciiBackground variant="clouds" className="text-primary" />
      </div>
      <h2>How it works</h2>
      <ul>
        <li>
          <strong>The engine</strong> installs into <code>lib/ascii</code> as plain source. It samples an input onto a
          character grid, shapes and dithers the tones, then paints glyphs to a canvas from a pre-rendered atlas.
        </li>
        <li>
          <strong>Three inputs</strong> cover everything: a <code>source</code> (image, video, canvas), a{" "}
          <code>field</code> (a function of x, y and time) or a <code>frame</code> (write the whole grid yourself).
        </li>
        <li>
          <strong>Components</strong> are thin wrappers you install one by one with the shadcn CLI. They&apos;re yours to
          edit.
        </li>
        <li>
          <strong>Theming</strong> is just CSS <code>color</code>. Put <code>text-primary</code> on any component.
        </li>
        <li>
          <strong>Export</strong> any canvas to plain text, SVG or PNG through its ref.
        </li>
      </ul>
      <h2>With an agent</h2>
      <p>
        The <code>asciicn-skill</code> item adds a SKILL.md for Claude Code, Codex, Cursor and friends. Ask for &ldquo;an
        ASCII starfield behind the hero&rdquo; and the agent writes a field on the engine, styled with your tokens.
      </p>
      <p>
        Next: <Link href="/docs/installation">Installation</Link>, or try the <Link href="/studio">Studio</Link> to
        convert your own images.
      </p>
    </Prose>
  )
}
