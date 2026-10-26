import type { Meta } from "./types"

export const interfaceMeta: Record<string, Meta> = {
  "ascii-progress": {
    usage: `import { AsciiProgress } from "@/components/ascii/ascii-progress"

<AsciiProgress value={62} label="upload" />
<AsciiProgress value={62} variant="arrow" width={20} />`,
    props: [
      ["value", "number", "—", "0 to 100."],
      ["width", "number", "24", "Bar width in characters."],
      ["variant", '"blocks" | "shade" | "hash" | "arrow" | "dots"', '"blocks"', "Blocks use eighth-width partials."],
      ["label", "string", "—", "Shown before the bar and used as the accessible name."],
      ["showValue", "boolean", "true", "Show the percentage."],
    ],
    examples: [
      {
        id: "variants",
        title: "Every variant",
        description: "Five glyph sets. `blocks` uses eighth-width partials, so a 24-character bar moves in 192 steps.",
        code: `{(["blocks", "shade", "hash", "arrow", "dots"] as const).map((v) => (
  <AsciiProgress key={v} value={value} variant={v} label={v.padEnd(6)} />
))}`,
      },
    ],
    notes: [
      ["Accessibility", "A real `role=\"progressbar\"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`. The glyphs and the percentage are `aria-hidden`."],
      ["Layout", "Every character has the same width, so the bar never reflows as it fills. Numbers use `tabular-nums`."],
      ["Dependencies", "None. Plain text in a `<div>`, safe in Server Components."],
    ],
  },
  "ascii-spinner": {
    usage: `import { AsciiSpinner } from "@/components/ascii/ascii-spinner"

<AsciiSpinner />
<AsciiSpinner variant="arc" label="Saving" />`,
    props: [
      ["variant", '"braille" | "line" | "arc" | "quadrant" | "bounce" | "pulse" | "grow"', '"braille"', "Frame set."],
      ["label", "string", '"Loading"', "Announced via role=status."],
    ],
    examples: [
      {
        id: "all",
        title: "Every spinner",
        description: "Each variant has its own frame rate, tuned so it reads as motion rather than flicker.",
        code: `{Object.keys(spinners).map((v) => (
  <AsciiSpinner key={v} variant={v} />
))}`,
      },
    ],
    notes: [
      ["Accessibility", "`role=\"status\"` with an `sr-only` label, so screen readers announce \"Loading\" once instead of every frame."],
      ["Motion", "Holds its first frame under `prefers-reduced-motion`."],
      ["Layout", "One character wide. Give it `w-[2ch]` next to text so wide glyphs don't nudge the line."],
    ],
  },
  "ascii-box": {
    usage: `import { AsciiBox } from "@/components/ascii/ascii-box"

<AsciiBox title="status" variant="round">
  All systems normal.
</AsciiBox>`,
    props: [
      ["variant", '"single" | "double" | "round" | "heavy" | "ascii"', '"single"', "Border glyph set."],
      ["title", "ReactNode", "—", "Set into the top edge."],
    ],
    examples: [
      {
        id: "borders",
        title: "Every border",
        description: "Five glyph sets, from Unicode box drawing down to plain `+-|` for places without it.",
        code: `{(["single", "double", "round", "heavy", "ascii"] as const).map((v) => (
  <AsciiBox key={v} variant={v} title={v}>…</AsciiBox>
))}`,
      },
    ],
    notes: [
      ["Layout", "Edges repeat with CSS instead of measuring text, so the frame stretches to any content and the corners stay on the character grid."],
      ["Theming", "The border takes the box's `color`; children keep their own. Put `text-muted-foreground` on the box and `text-foreground` inside."],
      ["Accessibility", "Border glyphs are `aria-hidden`. Only the title and children are read."],
    ],
  },
  "ascii-button": {
    usage: `import { AsciiButton } from "@/components/ascii/ascii-button"

<AsciiButton>Deploy</AsciiButton>
<AsciiButton variant="box" className="text-primary">Run</AsciiButton>`,
    props: [
      ["variant", '"brackets" | "box" | "arrow" | "underline"', '"brackets"', "The glyph frame, and how it animates."],
      ["size", '"sm" | "default" | "lg"', '"default"', "Heights match shadcn Button: 28, 32 and 36 px."],
      ["type", '"button" | "submit" | "reset"', '"button"', "Pass `submit` inside forms."],
      ["...props", 'ComponentProps<"button">', "—", "Every native button prop, including `ref`, `disabled` and `onClick`."],
    ],
    examples: [
      {
        id: "variants",
        title: "Every variant",
        description: "Hover or tab through them. `brackets` step out a character, `box` turns heavy, `arrow` grows a blinking cursor and `underline` types itself in.",
        code: `<AsciiButton variant="brackets">Deploy</AsciiButton>
<AsciiButton variant="box">Deploy</AsciiButton>
<AsciiButton variant="arrow">deploy</AsciiButton>
<AsciiButton variant="underline">Deploy</AsciiButton>`,
      },
      {
        id: "shadcn",
        title: "Next to shadcn Button",
        description: "Same heights, focus ring and disabled style as `Button`, so they share a toolbar. Colour comes from `text-*`.",
        code: `<Button variant="outline">Cancel</Button>
<AsciiButton disabled>Revert</AsciiButton>
<AsciiButton className="text-primary">Deploy</AsciiButton>`,
      },
    ],
    notes: [
      ["Accessibility", "A native `<button>`, so keyboard, form and screen reader behaviour come for free. Frame glyphs are `aria-hidden`; only the label is read. Focus shows the same ring as shadcn Button, and the frame animates on `:focus-visible` as well as hover."],
      ["Motion", "Under `prefers-reduced-motion` the frame still changes on hover but jumps instead of moving, and the cursor does not blink."],
      ["Layout", "Glyphs only move inside space the button already reserves, so it never changes width on hover."],
      ["Dependencies", "None, and no client JavaScript: hover states are CSS. The `arrow` cursor blinks with `animate-caret-blink` from tw-animate-css, which shadcn projects include; without it the cursor shows steadily."],
    ],
  },
  "ascii-skeleton": {
    usage: `import { AsciiSkeleton } from "@/components/ascii/ascii-skeleton"

<div aria-busy="true">
  <AsciiSkeleton lines={3} />
</div>`,
    props: [
      ["variant", '"text" | "block" | "avatar"', '"text"', "Text rows are spaced and taper on the last line; block and avatar are solid."],
      ["lines", "number", "3 (2 for block, avatar)", "Rows of glyphs."],
      ["width", "number | string", '"100%" (4 for avatar)', "A number is characters, a string any CSS width."],
    ],
    examples: [
      {
        id: "feed",
        title: "Loading feed",
        description: "Compose the variants into the shape of the content on its way. Every skeleton on the page shares one clock, so the wave runs across them in step.",
        code: `<div aria-busy="true" className="flex gap-3 text-muted-foreground/60">
  <AsciiSkeleton variant="avatar" />
  <div className="flex flex-1 flex-col gap-2">
    <AsciiSkeleton lines={1} width={14} />
    <AsciiSkeleton lines={2} />
  </div>
</div>`,
      },
    ],
    notes: [
      ["Accessibility", "The skeleton is `aria-hidden`, since shade glyphs mean nothing to a screen reader. Put `aria-busy=\"true\"` on the region that is loading and remove it when content arrives."],
      ["Motion", "A ░▒▓ crest travels diagonally across the rows. Under `prefers-reduced-motion` it is plain ░."],
      ["Theming", "Glyphs take the CSS `color`. `text-muted-foreground/60` reads as a placeholder without competing with real content."],
      ["Performance", "One 60 ms timer drives every skeleton on the page and stops when the last one unmounts. Server rendering outputs the static ░ frame, so hydration matches."],
    ],
  },
  "ascii-avatar": {
    usage: `import { AsciiAvatar } from "@/components/ascii/ascii-avatar"

<AsciiAvatar name="ada@lovelace.dev" />
<AsciiAvatar name="grace" variant="half" size={7} />`,
    props: [
      ["name", "string", "—", "Any string. Seeds the pattern and colour, and is the accessible name."],
      ["size", "number", "5", "Cells across. The pattern is mirrored, so odd sizes have a centre column."],
      ["variant", '"blocks" | "half" | "quadrants"', '"blocks"', "Blocks spend two characters per cell, half stacks two cells per character, quadrants packs 2×2 for finer shapes."],
      ["colored", "boolean", "true", "Tint with an oklch hue from the hash. Off uses the CSS `color`."],
    ],
    examples: [
      {
        id: "variants",
        title: "Variants",
        description: "The same name in each variant. All three come out roughly square, since a character cell is about 0.6 wide by 1 tall.",
        code: `{(["blocks", "half", "quadrants"] as const).map((v) => (
  <AsciiAvatar key={v} name="ada@lovelace.dev" variant={v} size={7} />
))}`,
      },
      {
        id: "pure",
        title: "As plain text",
        description: "`avatarLines` returns the same pattern as strings, for terminals, logs or a `<pre>`. `identicon` returns the raw boolean grid.",
        code: `import { avatarLines } from "@/components/ascii/ascii-avatar"

console.log(avatarLines("ada@lovelace.dev", 5, "half").join("\\n"))`,
      },
    ],
    notes: [
      ["Accessibility", "`role=\"img\"` labelled with `name`. Pass a friendlier `aria-label` when the seed is an email or id."],
      ["Determinism", "An FNV-1a hash seeds a small PRNG, so a string gives the same face on the server, the client and every visit. Nothing random at render, so no hydration mismatch."],
      ["Layout", "Size it with `text-*`; each cell is one or two characters, and rows are clipped to `1em` so blocks tile without gaps. Pick a size that puts cells on whole pixels (multiples of 5 px for a 0.6em-wide mono font such as Geist Mono) to avoid hairline seams between glyphs."],
      ["Dependencies", "None. Safe in Server Components."],
    ],
  },
  "ascii-divider": {
    usage: `import { AsciiDivider } from "@/components/ascii/ascii-divider"

<AsciiDivider className="text-muted-foreground" />
<AsciiDivider label="settings" align="start" />`,
    props: [
      ["variant", '"single" | "double" | "heavy" | "dashed" | "dotted" | "ascii" | "wave" | "tilde" | "dots" | "beads" | "chevron" | "zigzag" | "overline"', '"single"', "Named glyph pattern."],
      ["glyphs", "string", "—", "Your own repeating pattern, e.g. `·:·`. Overrides `variant`."],
      ["label", "ReactNode", "—", "Set into the rule."],
      ["align", '"start" | "center" | "end"', '"center"', "Where the label sits."],
    ],
    examples: [
      {
        id: "patterns",
        title: "Every pattern",
        description: "Single glyphs and repeating pairs. Multi-character patterns meet a centred label whole on both sides.",
        code: `{Object.keys(dividers).map((v) => (
  <AsciiDivider key={v} variant={v} label={v} />
))}`,
      },
    ],
    notes: [
      ["Accessibility", "`role=\"separator\"`. A string label becomes its `aria-label`; for any other label pass one yourself. Glyphs are `aria-hidden`."],
      ["Layout", "Glyphs repeat past the edge under `overflow: hidden` instead of measuring text, so the rule fills any width and reflows for free."],
      ["Theming", "Takes the CSS `color`. Put `text-muted-foreground` on the divider and a stronger colour on a ReactNode label."],
      ["Dependencies", "None. Plain text in a `<div>`, safe in Server Components."],
    ],
  },
}
