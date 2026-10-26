"use client"

import { AsciiCanvas, type AsciiCanvasProps, type AsciiFrame } from "@/lib/ascii"

export type AsciiGlobeProps = Omit<AsciiCanvasProps, "field" | "frame" | "source"> & {
  /** Rotation speed multiplier. 1 is one turn every 25 seconds. */
  speed?: number
  /** Axial tilt in degrees. */
  tilt?: number
  /** Draw latitude and longitude lines every 30°. */
  graticule?: boolean
  /** Share of the surface that is land, 0 to 1. */
  land?: number
  /** Picks a different set of continents. */
  seed?: number
  /** Direction the light comes from, in view space: x right, y up, z towards the viewer. */
  light?: [x: number, y: number, z: number]
}

const fract = (v: number) => v - Math.floor(v)
const smooth = (t: number) => t * t * (3 - 2 * t)
const hash = (x: number, y: number, z: number) => fract(Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453)

const bilerp = (a: number, b: number, c: number, d: number, u: number, v: number) =>
  a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v

function noise(x: number, y: number, z: number) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const iz = Math.floor(z)
  const u = smooth(x - ix)
  const v = smooth(y - iy)
  const w = smooth(z - iz)
  const near = bilerp(hash(ix, iy, iz), hash(ix + 1, iy, iz), hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), u, v)
  const far = bilerp(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), u, v)
  return near + (far - near) * w
}

function fbm(x: number, y: number, z: number) {
  let sum = 0
  let amp = 0.5
  for (let i = 0; i < 4; i++) {
    sum += amp * noise(x, y, z)
    x *= 2.03
    y *= 2.03
    z *= 2.03
    amp *= 0.5
  }
  return sum / 0.9375
}

const PITCH = 0.35
/** Spin at t = 0, chosen so the default map opens on a continent rather than open ocean. */
const FACING = 4
const STEP = Math.PI / 6

/** A rotating planet with fbm continents sampled on the sphere itself, so the map never seams. */
export function AsciiGlobe({
  speed = 1,
  tilt = 23.5,
  graticule = true,
  land = 0.35,
  seed = 0,
  light = [-0.5, 0.45, 0.75],
  ...props
}: AsciiGlobeProps) {
  const frame: AsciiFrame = (f, t, s) => {
    const spin = FACING + t * speed * ((Math.PI * 2) / 25)
    const roll = (tilt * Math.PI) / 180
    const cs = Math.cos(spin)
    const ss = Math.sin(spin)
    const cr = Math.cos(roll)
    const sr = Math.sin(roll)
    const cp = Math.cos(PITCH)
    const sp = Math.sin(PITCH)
    const ll = Math.hypot(...light) || 1
    const lx = light[0] / ll
    const ly = light[1] / ll
    const lz = light[2] / ll
    // fbm coverage is close to linear in its threshold over the useful range, measured on the unit sphere.
    const sea = 0.7 - Math.min(1, Math.max(0, land)) * 0.39
    const R = 0.44 * Math.min(1, s.aspect)
    const line = 0.6 / (f.height * R)
    const ox = seed * 17.31
    const oz = seed * 5.77

    for (let j = 0; j < f.height; j++) {
      const ny = (0.5 - (j + 0.5) / f.height) / R
      for (let i = 0; i < f.width; i++) {
        const nx = (((i + 0.5) / f.width - 0.5) * s.aspect) / R
        const r2 = nx * nx + ny * ny
        if (r2 > 1) continue
        const nz = Math.sqrt(1 - r2)
        const lit = Math.max(0, nx * lx + ny * ly + nz * lz)

        // View space back to body space: undo the pitch, then the axial roll, then the spin.
        const y1 = ny * cp + nz * sp
        const z1 = nz * cp - ny * sp
        const x2 = nx * cr + y1 * sr
        const y2 = y1 * cr - nx * sr
        const bx = x2 * cs - z1 * ss
        const bz = x2 * ss + z1 * cs

        const n = fbm(bx * 1.4 + ox, y2 * 1.4, bz * 1.4 + oz)
        let tone: number
        if (n > sea) {
          const height = Math.min(1, (n - sea) / 0.15)
          tone = (0.45 + 0.55 * lit) * (0.8 + 0.2 * height)
        } else {
          tone = 0.07 + 0.08 * lit
        }

        if (graticule) {
          const lat = Math.asin(Math.max(-1, Math.min(1, y2)))
          const lon = Math.atan2(bx, bz)
          const dLat = Math.abs(lat - Math.round(lat / STEP) * STEP)
          // Meridians stop short of the poles, where they would merge into a solid cap.
          const dLon = Math.abs(lat) > 1.3 ? 1 : Math.abs(lon - Math.round(lon / STEP) * STEP) * Math.cos(lat)
          if (Math.min(dLat, dLon) < line) tone = Math.max(tone, 0.18 + 0.14 * lit)
        }

        f.tone[j * f.width + i] = tone
      }
    }
  }

  return <AsciiCanvas aria-label="Rotating ASCII globe" frame={frame} {...props} />
}
