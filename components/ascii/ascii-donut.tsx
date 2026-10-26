"use client"

import { AsciiCanvas, type AsciiCanvasProps, type AsciiFrame } from "@/lib/ascii"

export type AsciiDonutProps = Omit<AsciiCanvasProps, "field" | "frame" | "source"> & {
  /** Rotation speed multiplier. */
  speed?: number
  /** Tube radius relative to the ring radius. */
  thickness?: number
}

/** The classic donut.c torus, lit and z-buffered on the ASCII grid. */
export function AsciiDonut({ speed = 1, thickness = 0.5, charset = "donut", ...props }: AsciiDonutProps) {
  const frame: AsciiFrame = (f, t, s) => {
    const A = t * speed
    const B = t * speed * 0.5
    const cA = Math.cos(A)
    const sA = Math.sin(A)
    const cB = Math.cos(B)
    const sB = Math.sin(B)
    const R1 = thickness
    const R2 = 1
    const K2 = 5
    // Screen is 1 unit tall and `aspect` wide; scale so the torus fills ~80% of the shorter side.
    const scale = Math.min(s.aspect, 1) * 0.4 * K2 / (R1 + R2)
    const zbuf = new Float32Array(f.width * f.height)

    for (let theta = 0; theta < Math.PI * 2; theta += 0.04) {
      const ct = Math.cos(theta)
      const st = Math.sin(theta)
      for (let phi = 0; phi < Math.PI * 2; phi += 0.015) {
        const cp = Math.cos(phi)
        const sp = Math.sin(phi)
        const cx = R2 + R1 * ct
        const cy = R1 * st
        const x = cx * (cB * cp + sA * sB * sp) - cy * cA * sB
        const y = cx * (sB * cp - sA * cB * sp) + cy * cA * cB
        const z = K2 + cA * cx * sp + cy * sA
        const ooz = 1 / z
        const px = Math.floor(((s.aspect / 2 + scale * x * ooz) / s.aspect) * f.width)
        const py = Math.floor((0.5 - scale * y * ooz) * f.height)
        if (px < 0 || px >= f.width || py < 0 || py >= f.height) continue
        const L = cp * ct * sB - cA * ct * sp - sA * st + cB * (cA * st - ct * sA * sp)
        const i = py * f.width + px
        if (ooz > zbuf[i]) {
          zbuf[i] = ooz
          f.tone[i] = L > 0 ? 0.08 + (L / Math.SQRT2) * 0.92 : 0.04
        }
      }
    }
  }

  return <AsciiCanvas aria-label="Spinning ASCII donut" frame={frame} charset={charset} {...props} />
}
