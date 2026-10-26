import { canvasNotes } from "./shared"
import type { Meta } from "./types"

export const imagesMeta: Record<string, Meta> = {
  "ascii-image": {
    usage: `import { AsciiImage } from "@/components/ascii/ascii-image"

<AsciiImage
  src="/team/ada.jpg"
  alt="Ada Lovelace"
  dither="floyd"
  fontSize={7}
  reveal
/>`,
    props: [
      ["src", "string", "—", "Image URL. Cross-origin images need CORS headers."],
      ["alt", "string", "—", "Accessible label for the canvas."],
      ["reveal", "boolean", "false", "Cross-fade to the original on hover."],
    ],
    inherits: true,
    examples: [
      {
        id: "thermal",
        title: "Edges and a palette",
        description: "`edges` traces contours with `| / - \\` where the tone changes sharply, and a palette maps tone to colour.",
        code: `import { palettes } from "@/lib/ascii"

<AsciiImage
  src="/cabin.jpg"
  alt="A red-roofed cabin by a lake below a snowy peak"
  edges={0.3}
  color={palettes.thermal}
  fontSize={7}
/>`,
      },
    ],
    notes: canvasNotes("The canvas has `role=\"img\"` and takes `alt` as its label. The reveal image is decorative (`alt=\"\"`), so the label isn't read twice."),
  },
  "ascii-video": {
    usage: `import { AsciiVideo } from "@/components/ascii/ascii-video"

<AsciiVideo src="/clips/surf.mp4" dither="bayer" />
<AsciiVideo src="webcam" aria-label="Your camera" />`,
    props: [
      ["src", 'string | MediaStream | "webcam"', "—", "A URL, a stream, or the user's camera."],
      ["mirror", "boolean", "webcam only", "Flip horizontally."],
      ["onError", "(error) => void", "—", "Called when playback or camera access fails."],
    ],
    inherits: true,
    notes: [
      ["Privacy", "Camera frames are drawn locally and never leave the browser. The stream stops when the component unmounts or `src` changes."],
      ["Accessibility", "Pass `aria-label` to say what the video shows. The underlying `<video>` is muted and never rendered."],
      ["Motion", "Video keeps playing under `prefers-reduced-motion`, since the user chose to start it. Drawing pauses offscreen."],
      ["Performance", "Each frame is sampled once onto the grid, so cost tracks the number of cells, not the video resolution."],
    ],
  },
  "ascii-image-compare": {
    usage: `import { AsciiImageCompare } from "@/components/ascii/ascii-image-compare"

<AsciiImageCompare
  src="/products/sneaker.jpg"
  alt="A white sneaker"
  dither="floyd"
  fontSize={7}
/>`,
    props: [
      ["src", "string", "—", "Image URL. Loaded once and shared by the photo and the canvas. Cross-origin images need CORS headers."],
      ["alt", "string", "—", "Describes the photo. The canvas is labelled with it too."],
      ["defaultPosition", "number", "50", "Starting divider position from the left, 0 to 100."],
      ["position", "number", "—", "Controlled position. Pair it with `onPositionChange`."],
      ["onPositionChange", "(position: number) => void", "—", "Called while dragging and on every key press."],
    ],
    inherits: true,
    examples: [
      {
        id: "controlled",
        title: "Controlled",
        description: "Pass `position` and `onPositionChange` to drive the divider from your own buttons, or to sync it with something else on the page.",
        code: `const [position, setPosition] = useState(50)

<AsciiImageCompare
  src="/cabin.jpg"
  alt="A red-roofed cabin by a lake below a snowy peak"
  position={position}
  onPositionChange={setPosition}
  charset="blocks"
  className="text-primary"
/>
<Button onClick={() => setPosition(0)}>ASCII</Button>
<Button onClick={() => setPosition(50)}>Split</Button>
<Button onClick={() => setPosition(100)}>Photo</Button>`,
      },
    ],
    notes: [
      ["Accessibility", "The divider is a `role=\"slider\"` with `aria-valuenow`. Arrow keys move it by 1, Shift or Page Up/Down by 10, Home and End jump to the edges. The photo keeps its `alt`."],
      ["Pointer", "Press anywhere on the image and drag. The pointer is captured, so dragging past the edge keeps working. Vertical touch scrolling still scrolls the page."],
      ["Theming", "Glyphs take the CSS `color`, so `text-primary` themes them. The divider line uses `mix-blend-difference` to stay visible over any photo."],
      ["Performance", "The ASCII canvas draws once per prop change. Dragging only moves a `clip-path` on the photo, so the canvas never redraws."],
    ],
  },
  "ascii-scroll-reveal": {
    usage: `import { AsciiScrollReveal } from "@/components/ascii/ascii-scroll-reveal"

<AsciiScrollReveal
  src="/work/cover.jpg"
  alt="Project cover"
  from={32}
  to={6}
/>`,
    props: [
      ["src", "string", "—", "Image URL. Cross-origin images need CORS headers."],
      ["alt", "string", "—", "Accessible label for the canvas."],
      ["from", "number", "32", "Cell size in pixels as the image enters from below."],
      ["to", "number", "6", "Cell size once the image's centre reaches the middle of the view."],
      ["reveal", '"photo" | "ascii"', '"photo"', "Photo cross-fades to the original over the last quarter. ASCII stays glyphs."],
      ["onProgress", "(progress: number) => void", "—", "Scroll progress from 0 to 1, at most once per frame."],
    ],
    inherits: true,
    examples: [
      {
        id: "ascii",
        title: "Stay in glyphs",
        description: "`reveal=\"ascii\"` stops at the finest grid instead of fading to the photo. With braille and a palette it reads like a print.",
        code: `import { palettes } from "@/lib/ascii"

<div className="h-72 overflow-y-auto">
  <AsciiScrollReveal
    src="/garden.jpg"
    alt="Marble columns among flowers"
    reveal="ascii"
    charset="braille"
    from={24}
    to={5}
    color={palettes.cyanotype}
  />
</div>`,
      },
    ],
    notes: [
      ["Scroll container", "Progress follows the nearest ancestor that scrolls vertically, or the viewport when there is none. It reaches 1 when the image is centred and stays there as it scrolls out the top."],
      ["Accessibility", "The canvas has `role=\"img\"` and takes `alt` as its label. The fade-in photo is decorative (`alt=\"\"`), so the label isn't read twice."],
      ["Motion", "Under `prefers-reduced-motion` the image shows its final state straight away and ignores scrolling."],
      ["Performance", "Scroll is read once per frame, and only while the image is on screen. The canvas redraws only when the cell size crosses a whole pixel; the photo fade is a CSS variable."],
    ],
  },
  "ascii-marquee": {
    usage: `import { AsciiMarquee } from "@/components/ascii/ascii-marquee"

<AsciiMarquee
  items={["acme", "northwind", "lumen", "orbital"]}
  className="text-muted-foreground"
/>`,
    props: [
      ["items", "string[]", "—", "Words or wordmarks, each rasterised and drawn in glyphs."],
      ["children", "ReactNode", "—", "Your own items instead of `items`, e.g. SVG logos or `AsciiImage`s. Each direct child is one item."],
      ["speed", "number", "40", "Pixels per second, however many items there are."],
      ["direction", '"left" | "right"', '"left"', "Which way the row travels."],
      ["gap", "number", "48", "Space between items in pixels."],
      ["size", "number", "40", "Height of each word in pixels."],
      ["fade", "number", "64", "Width of the edge fade in pixels. 0 turns it off."],
      ["pauseOnHover", "boolean", "true", "Pause while hovered or while anything inside has focus."],
      ["font", "string", "900 sans", "CSS font used to rasterise each word. Every word shares one x-height, ascenders or not."],
      ["charset, fontSize, color, dither, opacity", "AsciiCanvas props", "braille, 4", "Passed to every word in `items`."],
    ],
    examples: [
      {
        id: "rows",
        title: "Opposing rows",
        description: "Two marquees running in opposite directions make a headline band. A bigger `size` and cell keep the letters crisp at headline scale.",
        code: `<AsciiMarquee
  items={["design", "build", "ship"]}
  size={72}
  fontSize={6}
  className="text-primary"
/>
<AsciiMarquee
  items={["iterate", "measure", "learn"]}
  direction="right"
  size={72}
  fontSize={6}
  className="text-muted-foreground"
/>`,
      },
      {
        id: "children",
        title: "Your own items",
        description: "Pass children to scroll anything, here a strip of ASCII photos. Give each child a fixed width so the loop length is stable.",
        code: `<AsciiMarquee gap={16} speed={24}>
  <AsciiImage src="/meadow.jpg" alt="Meadow" fontSize={6} className="w-36" />
  <AsciiImage src="/cabin.jpg" alt="Cabin" fontSize={6} className="w-36" />
  <AsciiImage src="/arcade.jpg" alt="Arcade" fontSize={6} className="w-36" />
  <AsciiImage src="/garden.jpg" alt="Garden" fontSize={6} className="w-36" />
</AsciiMarquee>`,
      },
    ],
    notes: [
      ["Accessibility", "Words form a list, and each canvas is labelled with its word. The copies that make the loop seamless are `aria-hidden` and `inert`, so links inside children aren't read or tabbed to twice."],
      ["Motion", "A plain CSS animation that pauses on hover and focus. Under `prefers-reduced-motion` the copies are dropped and the items wrap into a centred, still row."],
      ["Seamless loop", "The row is repeated until each half is wider than the view, then the track slides by exactly one half, so there is never a gap or a jump."],
      ["Performance", "Each word is a small static canvas that draws once. Movement is a GPU transform, so nothing redraws while it scrolls."],
    ],
  },
}
