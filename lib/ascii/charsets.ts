// Each ramp runs from empty to full ink. "braille" and "quadrants" are not ramps: they pack a 2×4 or 2×2 grid into every cell.
export const charsets = {
  standard: " .:-=+*#%@",
  detailed:
    " .'`^\",:;Il!i><~+_-?][}{1)(|\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  mixed: " .·:-=+*oxO%#&░▒▓█",
  blocks: " ░▒▓█",
  dots: " ·•●",
  minimal: " .oO@",
  hatch: " ·-+=#",
  cross: " ·+x×X╳",
  diagonal: " ·/╱X╳",
  diamond: " ·⋄◇◈◆",
  lines: " .╷│┃▐█",
  donut: " .,-~:;=!*#$@",
  katakana: " ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ",
  binary: " 01",
  braille: "braille",
  quadrants: "quadrants",
} as const

export type CharsetName = keyof typeof charsets

export function resolveCharset(charset: string): string {
  return charset in charsets ? charsets[charset as CharsetName] : charset
}

/** Gradient stops for `color`, from faint to full ink. */
export const palettes = {
  thermal: ["#1b0c41", "#7b1fa2", "#e53935", "#ffb300", "#fffde7"],
  matrix: ["#002b0f", "#00a33a", "#b6ffcb"],
  sunset: ["#2d1b69", "#d6336c", "#ffb86b"],
  cyanotype: ["#0b2a6f", "#4f7fd1", "#f2f6ff"],
} satisfies Record<string, string[]>
