import { backgroundsMeta } from "./backgrounds.meta"
import { chartsMeta } from "./charts.meta"
import { imagesMeta } from "./images.meta"
import { interfaceMeta } from "./interface.meta"
import { textMeta } from "./text.meta"
import type { Meta } from "./types"

export { canvasProps } from "./shared"

export const meta: Record<string, Meta> = {
  ...backgroundsMeta,
  ...imagesMeta,
  ...textMeta,
  ...interfaceMeta,
  ...chartsMeta,
}
