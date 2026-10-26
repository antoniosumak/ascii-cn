import type { Metadata } from "next"

import { CodeBlock } from "@/components/site/code-block"
import { Prose } from "@/components/site/docs"
import { InstallCommand } from "@/components/site/install"
import { siteUrl } from "@/lib/site"

export const metadata: Metadata = { title: "Installation" }

export default function InstallationPage() {
  return (
    <Prose>
      <h1>Installation</h1>
      <p>You need a project with shadcn/ui set up (a <code>components.json</code>), Tailwind v4 and React 19.</p>

      <h2>1. Add the registry</h2>
      <p>
        Add the <code>@asciicn</code> namespace to <code>components.json</code>, so components can find the engine:
      </p>
      <CodeBlock
        code={`{
  "registries": {
    "@asciicn": "${siteUrl}/r/{name}.json"
  }
}`}
      />

      <h2>2. Add components</h2>
      <InstallCommand items="@asciicn/ascii-image @asciicn/ascii-background" />
      <p>
        The first one also writes the engine to <code>lib/ascii/</code>. Components land in{" "}
        <code>components/ascii/</code>.
      </p>

      <h2>Engine and agent skill</h2>
      <p>To build your own effects, or let your coding agent do it, install the skill. It brings the engine with it:</p>
      <InstallCommand items="@asciicn/asciicn-skill" />
      <p>
        That writes <code>.claude/skills/asciicn/SKILL.md</code> and <code>.agents/skills/asciicn/SKILL.md</code>, which
        Claude Code, Codex, Cursor and other Agent Skills tools read. Commit them so every teammate and agent sees the
        same version.
      </p>
      <p>
        Using another agent, or want the skill in every project? The skills CLI asks which agents you use and writes to
        each one&rsquo;s folder (add <code>-g</code> for global). It installs the skill only, so add the engine with{" "}
        <code>@asciicn/ascii-core</code> as well:
      </p>
      <InstallCommand cli="skills add" items={siteUrl} />
      <p>Engine only:</p>
      <InstallCommand items="@asciicn/ascii-core" />

      <h2>Updating</h2>
      <p>
        The engine is source in your repo and never updates by itself. To refresh it, copy out local edits, delete{" "}
        <code>lib/ascii</code> and add <code>@asciicn/ascii-core</code> again.
      </p>
    </Prose>
  )
}
