import { readFileSync } from "node:fs"
import { join } from "node:path"

export function GET() {
  return new Response(readFileSync(join(process.cwd(), "skill/SKILL.md")), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
