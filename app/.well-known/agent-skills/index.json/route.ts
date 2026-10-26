import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// Discovery index for `npx skills add https://asciicn.sumak.dev`, which installs into any agent's skills folder.
export function GET() {
  const skill = readFileSync(join(process.cwd(), "skill/SKILL.md"))
  return Response.json({
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: "asciicn",
        type: "skill-md",
        description: String(skill).match(/^description: (.+)$/m)![1],
        url: "asciicn/SKILL.md",
        digest: `sha256:${createHash("sha256").update(skill).digest("hex")}`,
      },
    ],
  })
}
