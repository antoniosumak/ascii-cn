# asciicn

An ASCII engine and shadcn/ui registry of ASCII components: images, video, webcam, animated backgrounds, display type and terminal-style UI. Plus a Studio for converting your own media.

```bash
pnpm dev               # docs site + studio on :3000
pnpm registry:build    # registry.json -> public/r/*.json
```

- `lib/ascii/` — the engine (`AsciiCanvas`, sampling, dithering, glyph atlas, text/SVG/PNG export)
- `components/ascii/` — registry components
- `skill/SKILL.md` — agent skill shipped by the `asciicn-skill` item
- `registry.json` — source of truth for the registry and the docs sidebar

Set `NEXT_PUBLIC_SITE_URL` to the deployed origin so install docs point at the right registry URL.
