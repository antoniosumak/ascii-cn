import { canvasNotes } from "./shared"
import type { Meta } from "./types"

export const textMeta: Record<string, Meta> = {
  "ascii-text": {
    usage: `import { AsciiText } from "@/components/ascii/ascii-text"

<AsciiText text="launch" className="text-primary" />`,
    props: [
      ["text", "string", "—", "What to write. Also the accessible label."],
      ["font", "string", '"900 160px ui-sans-serif…"', "Any CSS font, rasterised then filled with glyphs."],
      ["fontSize", "number", "8", "Glyph size, so smaller means finer letters."],
      ["charset", "string", '"blocks"', "░▒▓█ gives soft anti-aliased edges."],
    ],
    inherits: true,
    examples: [
      {
        id: "serif",
        title: "Serif in braille",
        description: "`font` takes any CSS font shorthand. Braille dots trace the curves of a serif far more finely than full glyphs.",
        code: `<AsciiText text="Folio" font="italic 700 200px Georgia, serif" charset="braille" fontSize={9} />`,
      },
      {
        id: "not-found",
        title: "Not found page",
        description: "Big type carries an empty page on its own. Keep a real `<h1>` for screen readers next to it.",
        code: `<main className="grid place-items-center gap-4 text-center">
  <h1 className="sr-only">Page not found</h1>
  <AsciiText text="404" className="max-w-sm text-primary" />
  <p>This page drifted off the grid.</p>
  <Button>Go home</Button>
</main>`,
      },
    ],
    notes: canvasNotes("The canvas is labelled with `text`, so screen readers read the word, not the glyphs. On headings, keep a visually hidden `<h1>` too."),
  },
  "ascii-scramble": {
    usage: `import { AsciiScramble } from "@/components/ascii/ascii-scramble"

<AsciiScramble text="access granted" />
<AsciiScramble text="hover me" trigger="hover" />`,
    props: [
      ["text", "string", "—", "Final text. Screen readers get it immediately."],
      ["trigger", '"mount" | "hover"', '"mount"', "When to decode."],
      ["duration", "number", "900", "Milliseconds until settled."],
      ["glyphs", "string", "!<>-_\\/[]{}…", "Noise characters."],
    ],
    examples: [
      {
        id: "nav",
        title: "Navigation on hover",
        description: "With `trigger=\"hover\"` every pointer enter decodes the label again. Short durations keep it playful rather than slow.",
        code: `<nav className="flex gap-6">
  {["work", "about", "contact"].map((l) => (
    <a key={l} href={\`#\${l}\`}>
      <AsciiScramble text={l} trigger="hover" duration={400} />
    </a>
  ))}
</nav>`,
      },
    ],
    notes: [
      ["Accessibility", "The final text sits in an `sr-only` span from the first render. The noise is `aria-hidden`, so nothing garbled is ever announced."],
      ["Motion", "Under `prefers-reduced-motion` the text appears settled and never scrambles."],
      ["Layout", "Glyphs are monospace and spaces stay put, so the width never jumps while decoding."],
      ["Dependencies", "None. No engine, no canvas: one `requestAnimationFrame` loop while decoding."],
    ],
  },
  "ascii-dissolve": {
    usage: `import { AsciiDissolve } from "@/components/ascii/ascii-dissolve"

<AsciiDissolve text="Made of characters" />
<AsciiDissolve text="hover me" trigger="hover" />`,
    props: [
      ["text", "string", "—", "Final text. Screen readers get it immediately."],
      ["trigger", '"view" | "mount" | "hover"', '"view"', "View resolves once the text scrolls into view, mount resolves on mount, hover dissolves and resolves on every pointer enter."],
      ["dissolved", "boolean", "—", "Controls the state yourself and ignores `trigger`. True dissolves, false resolves."],
      ["duration", "number", "900", "Milliseconds for one full dissolve or resolve. A hover does both, so it takes twice as long."],
      ["glyphs", "string", '"#%&@*+=:;"', "Noise a character crumbles into before it thins out through ▓▒░."],
    ],
    examples: [
      {
        id: "nav",
        title: "Links on hover",
        description: "With `trigger=\"hover\"` each pointer enter crumbles the label to dust and draws it back. Short durations keep it a flicker rather than a wait.",
        code: `<nav className="flex gap-6">
  {["index", "archive", "colophon"].map((l) => (
    <a key={l} href={\`#\${l}\`}>
      <AsciiDissolve text={l} trigger="hover" duration={350} />
    </a>
  ))}
</nav>`,
      },
      {
        id: "redact",
        title: "Presentation mode",
        description: "Pass `dissolved` to drive it yourself, here from a toggle that hides personal details before screen sharing. Reversing mid-way retraces the same grains.",
        code: `const [hidden, setHidden] = useState(false)

<Button onClick={() => setHidden((h) => !h)}>
  {hidden ? "Show details" : "Hide details"}
</Button>
<dl>
  <dt>Name</dt>
  <dd><AsciiDissolve text="Ada Lovelace" dissolved={hidden} /></dd>
  <dt>Email</dt>
  <dd><AsciiDissolve text="ada@analytical.engine" dissolved={hidden} /></dd>
</dl>`,
      },
    ],
    notes: [
      ["Accessibility", "The real text sits in an `sr-only` span from the first render and the noise is `aria-hidden`, so dissolving is visual only. Don't use it to hide secrets: screen readers and the DOM still have the text."],
      ["Motion", "Under `prefers-reduced-motion` the text always shows resolved, whatever the trigger or `dissolved`."],
      ["Layout", "Each noise glyph is drawn over its character and clipped to that character's width, so it works in any font, proportional or not, and the text never reflows."],
      ["Dependencies", "None. One `requestAnimationFrame` loop while it moves, repainting at about 30 fps, plus an IntersectionObserver for `trigger=\"view\"`."],
    ],
  },
}
