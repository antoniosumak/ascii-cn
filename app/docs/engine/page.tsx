import type { Metadata } from "next"

import { CodeBlock } from "@/components/site/code-block"
import { Prose, PropsTable } from "@/components/site/docs"
import { canvasProps } from "@/components/site/catalog/meta"
import { OrbitDemo } from "@/components/site/orbit-demo"
import { charsets } from "@/lib/ascii/charsets"

export const metadata: Metadata = { title: "Engine" }

export default function EnginePage() {
  return (
    <Prose>
      <h1>Engine</h1>
      <p>
        <code>lib/ascii</code> is four small files. <code>&lt;AsciiCanvas&gt;</code> is the React primitive; everything in
        the catalogue is a wrapper around it.
      </p>

      <h2>Pipeline</h2>
      <CodeBlock
        code={`input ──▶ sample ──▶ shape ──▶ glyphs ──▶ paint
source     drawImage   contrast   ramp or    glyph atlas
field      f(x,y,t)    gamma      braille,   drawImage
                       edges      quadrants
frame      you write   dither                per cell
                                             palette`}
      />

      <h2>Write your own field</h2>
      <p>
        A field returns ink from 0 to 1 for every cell. <code>x</code> and <code>y</code> run 0 to 1, <code>t</code> is
        seconds, and <code>s</code> carries the grid size, aspect ratio and pointer.
      </p>
      <div className="h-48 overflow-hidden rounded-xl border">
        <OrbitDemo />
      </div>
      <CodeBlock
        code={`<AsciiCanvas
  aria-hidden
  opacity
  className="text-primary"
  field={(x, y, t, s) => {
    const dx = (x - 0.5 - 0.25 * Math.cos(t)) * s.aspect
    const dy = y - 0.5 - 0.25 * Math.sin(t)
    return Math.max(0, 1 - Math.hypot(dx, dy) * 4)
  }}
/>`}
      />

      <h2>Frames</h2>
      <p>
        When cells depend on each other (3D with a z-buffer, particles, cellular automata) pass <code>frame</code>{" "}
        instead. It gets the whole <code>Frame</code>: write <code>f.tone</code>, and <code>f.glyph</code> char codes to
        force specific characters. The donut and matrix rain are built this way.
      </p>
      <CodeBlock
        code={`<AsciiCanvas
  frame={(f, t) => {
    for (let i = 0; i < f.tone.length; i++) f.tone[i] = Math.random() < 0.02 ? 1 : 0
  }}
/>`}
      />

      <h2>Export</h2>
      <CodeBlock
        code={`const ascii = useRef<AsciiHandle>(null)

<AsciiCanvas ref={ascii} source={img} />

ascii.current.text()  // plain text, one line per row
ascii.current.svg()   // scalable <svg> with your theme colour
await ascii.current.png()  // Blob at device resolution`}
      />

      <h2>Charsets</h2>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <tbody>
            {Object.entries(charsets).map(([name, ramp]) => (
              <tr key={name} className="border-b last:border-0">
                <td className="px-3 py-2 font-mono text-[13px] text-primary">{name}</td>
                <td className="px-3 py-2 font-mono whitespace-pre text-foreground">
                  {name === "braille"
                    ? "⠀⠁⠃⠇⡇⡏⡟⡿⣿  (2×4 dots per cell)"
                    : name === "quadrants"
                      ? " ▘▀▛█▖▌▞▟▄  (2×2 blocks per cell)"
                      : ramp.length > 40 ? ramp.slice(0, 40) + "…" : ramp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>AsciiCanvas props</h2>
      <p>
        Plus exactly one input: <code>source</code>, <code>field</code> or <code>frame</code>. Also{" "}
        <code>fit</code>, <code>mirror</code>, <code>ink</code>, <code>lineHeight</code> and <code>onRender</code>.
      </p>
      <PropsTable props={canvasProps} />

      <h2>Performance</h2>
      <ul>
        <li>Glyphs are drawn from a pre-rendered atlas; source-colour mode falls back to fillText.</li>
        <li>Animation runs at 30 fps by default and stops while offscreen or in a hidden tab.</li>
        <li>
          <code>prefers-reduced-motion</code> freezes fields and frames on their current frame. Video keeps playing.
        </li>
      </ul>
    </Prose>
  )
}
