import { AsciiLineChart, type AsciiLineChartProps } from "@/components/ascii/ascii-line-chart"

export type AsciiAreaChartProps = Omit<AsciiLineChartProps, "area">

/** An ASCII line chart with glyph-filled areas, denser just under each line. `stacked` piles the series on each other. */
export function AsciiAreaChart(props: AsciiAreaChartProps) {
  return <AsciiLineChart area {...props} />
}
