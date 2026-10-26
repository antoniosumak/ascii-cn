import { backgroundsDemos } from "./backgrounds.demo"
import { chartsDemos } from "./charts.demo"
import { imagesDemos } from "./images.demo"
import { interfaceDemos } from "./interface.demo"
import { textDemos } from "./text.demo"
import type { Demo } from "./types"

export const demos: Record<string, Demo> = {
  ...backgroundsDemos,
  ...imagesDemos,
  ...textDemos,
  ...interfaceDemos,
  ...chartsDemos,
}
