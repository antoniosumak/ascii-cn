import type { Meta } from "./types"

export const chartsMeta: Record<string, Meta> = {
  "ascii-chart": {
    usage: `import { AsciiBarChart, AsciiSparkline } from "@/components/ascii/ascii-chart"

<AsciiSparkline data={[3, 5, 4, 8, 12]} label="Signups, last 5 days" />

<AsciiBarChart
  data={[{ label: "cpu", value: 62 }, { label: "mem", value: 31 }]}
  format={(v) => \`\${v}%\`}
/>`,
    props: [
      ["data", "number[] | { label, value }[]", "—", "Sparkline takes numbers, bar chart takes labelled rows."],
      ["label", "string", "—", "Sparkline only. Describe the trend for screen readers."],
      ["min / max", "number", "data range", "Fix the scale."],
      ["width", "number", "32", "Bar chart: characters for the largest bar."],
      ["format", "(v) => string", "String", "Bar chart value label."],
      ["animate", "boolean", "true", "Sparklines rise in from the left and bars grow row by row the first time they scroll into view."],
    ],
    examples: [
      {
        id: "table",
        title: "Sparklines in a table",
        description: "One character per value means a sparkline fits in a table cell and lines up across rows. Pass the same `min` and `max` to compare rows fairly.",
        code: `{services.map((s) => (
  <tr key={s.name}>
    <td>{s.name}</td>
    <td>
      <AsciiSparkline data={s.latency} min={0} max={400} label={\`\${s.name} latency\`} />
    </td>
  </tr>
))}`,
      },
    ],
    notes: [
      ["Accessibility", "Sparklines are `role=\"img\"` with your `label`. Bar charts are a `role=\"table\"` with row headers, so values are read as data."],
      ["Precision", "Eighth blocks (▁ to █ and ▏ to █) give eight steps inside each character."],
      ["Dependencies", "None. Plain text, safe in Server Components and emails."],
    ],
  },
  "ascii-line-chart": {
    usage: `import { AsciiLineChart } from "@/components/ascii/ascii-line-chart"

<AsciiLineChart
  label="Visitors today"
  series={[
    { label: "today", data: [220, 310, 540, 980, 1240, 860] },
    { label: "yesterday", data: [200, 280, 450, 760, 990, 720], className: "text-muted-foreground" },
  ]}
  labels={["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"]}
/>`,
    props: [
      ["series", "{ label, data, className? }[]", "—", "One line per entry. `className` colours it; otherwise primary, amber, sky and destructive in turn."],
      ["label", "string", "—", "Names the chart for screen readers and captions its data table."],
      ["labels", "string[]", "—", "One per data point. A few are shown along the x axis, and the current one in the readout."],
      ["width", "number", "60", "Plot width in characters. Narrows to fit a smaller container."],
      ["height", "number", "12", "Plot height in rows, one value level each."],
      ["min / max", "number", "data range", "Fix the y scale. Values outside it are clamped to the edge."],
      ["stacked", "boolean", "false", "Pile each series on the ones before it. The readout still shows each series' own value."],
      ["format", "(v) => string", "String", "Formats axis ticks, the readout and the data table."],
      ["animate", "boolean", "true", "Draw the lines in from the left the first time the chart scrolls into view."],
    ],
    examples: [
      {
        id: "format",
        title: "Units and a fixed scale",
        description: "Pin `min={0}` so a small change does not look like a cliff, and pass `format` to put units on the axis and in the readout.",
        code: `<AsciiLineChart
  label="API latency"
  series={[
    { label: "p50", data: p50 },
    { label: "p95", data: p95, className: "text-amber-500" },
  ]}
  labels={hours}
  min={0}
  width={40}
  height={8}
  format={(v) => \`\${v}ms\`}
/>`,
      },
    ],
    notes: [
      ["Accessibility", "A focusable group named by `label`. Arrow keys move the cursor, Home and End jump to the ends, Escape clears it, and a live region reads out the values. A visually hidden table holds every data point."],
      ["Drawing", "Lines are plain ASCII: `_` along a row, `/` or `\\` to step one row and `|` for bigger jumps. Values between samples are interpolated, one per column. Every cell belongs to one series, and the first series wins where lines meet, so it always reads unbroken."],
      ["Theming", "Each series is its own text layer, so any `text-*` class colours it. Hovering a series in the readout fades the others."],
      ["Motion", "The plot is revealed left to right with a clip. The cursor glides between points. Everything holds still under `prefers-reduced-motion`."],
      ["Sizing", "The chart fills its container's width and draws up to `width` characters of plot, fewer when the container is narrower. Give it a width in inline or table layouts."],
      ["Fonts", "Rows are exactly 1em tall and clipped, so `_` sits on the row below and strokes join up in any monospace font. The cursor and x labels are placed by percentage, so they stay aligned even if a fallback draws the axes at another width."],
      ["Dependencies", "`motion` for the entrance and transitions."],
    ],
  },
  "ascii-area-chart": {
    usage: `import { AsciiAreaChart } from "@/components/ascii/ascii-area-chart"

<AsciiAreaChart
  label="Traffic by source"
  series={[
    { label: "search", data: [120, 180, 260, 340, 310, 280] },
    { label: "direct", data: [80, 110, 150, 190, 170, 160], className: "text-sky-500" },
  ]}
  labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
  stacked
/>`,
    props: [
      ["series", "{ label, data, className? }[]", "—", "One area per entry, drawn in order. `className` colours it."],
      ["label", "string", "—", "Names the chart for screen readers and captions its data table."],
      ["labels", "string[]", "—", "One per data point, along the x axis and in the readout."],
      ["stacked", "boolean", "false", "Pile each series on the ones before it, so the top line is the total. Each fill runs down to the series below."],
      ["width / height", "number", "60 / 12", "Plot size in characters and rows."],
      ["glyphs", "string", "\"shade\"", "How fills look: `shade`, `hash`, `dollar`, `diamond` or `circle`, or any five glyphs. Fills use the second and third."],
      ["min / max", "number", "data range", "Fix the y scale. Stacked charts start at 0."],
      ["format", "(v) => string", "String", "Formats axis ticks, the readout and the data table."],
      ["animate", "boolean", "true", "Draw the lines in from the left, then fade the fills in."],
    ],
    examples: [
      {
        id: "overlap",
        title: "Overlapping areas",
        description: "Leave out `stacked` to compare series on the same baseline. Hover a name in the readout to fade the others.",
        code: `<AsciiAreaChart
  label="Memory"
  series={[
    { label: "heap", data: heap },
    { label: "rss", data: rss, className: "text-amber-500" },
  ]}
  labels={minutes}
  min={0}
  format={(v) => \`\${v}MB\`}
/>`,
      },
    ],
    notes: [
      ["Built on", "`AsciiLineChart` with `area`, so it shares its ASCII lines, axes, cursor, keyboard support and hidden data table."],
      ["Fill", "The top third of each band uses the denser glyph (`▒` with `shade`) and the rest the lighter one (`░`). Fills start on the row under each `_`, and stacked bands run down to the line below, so each series keeps its own colour with no gaps. With `shade`, the cells a `/`, `\\` or `|` passes through are filled too, cut along the stroke with `clip-path`. Each fill glyph is centred in its own column, so symbols from a fallback font still tile the area."],
      ["Motion", "A left-to-right clip reveals the lines over a second, then the fills fade in. Off under `prefers-reduced-motion`."],
      ["Dependencies", "`motion`, plus the line chart, which the CLI installs with it."],
    ],
  },
  "ascii-column-chart": {
    usage: `import { AsciiColumnChart } from "@/components/ascii/ascii-column-chart"

<AsciiColumnChart
  label="Deploys per month"
  labels={["Jan", "Feb", "Mar", "Apr"]}
  series={[{ label: "deploys", data: [42, 58, 51, 77] }]}
/>`,
    props: [
      ["series", "{ label, data, className? }[]", "—", "One bar per series in each group. `className` colours it; otherwise primary, amber, sky and destructive in turn."],
      ["labels", "string[]", "—", "One per group, shown under it and in the readout."],
      ["label", "string", "—", "Names the chart for screen readers and captions its data table."],
      ["height", "number", "10", "Plot height in cells."],
      ["glyphs", "string", "\"shade\"", "How the cells look: `shade`, `hash`, `dollar`, `diamond` or `circle`, or any five glyphs from empty to the highlighted cell, e.g. `\"·-=#@\"`."],
      ["max", "number", "largest value", "Fix the top of the scale. Bars start at 0."],
      ["format", "(v) => string", "String", "Formats axis ticks, the readout and the data table."],
      ["animate", "boolean", "true", "Bars rise from the baseline one after another the first time the chart scrolls into view."],
    ],
    examples: [
      {
        id: "grouped",
        title: "Grouped series",
        description: "Pass several series to put bars side by side, one column of blocks each.",
        code: `<AsciiColumnChart
  label="Signups"
  labels={["Q1", "Q2", "Q3", "Q4"]}
  series={[
    { label: "2025", data: [120, 160, 140, 210], className: "text-muted-foreground" },
    { label: "2026", data: [180, 220, 260, 310] },
  ]}
  height={8}
/>`,
      },
    ],
    notes: [
      ["Accessibility", "A focusable group named by `label`. Arrow keys move between groups, Home and End jump to the ends, Escape clears, and a live region reads the values. A visually hidden table holds every bar."],
      ["Blocks", "Every cell is a glyph clipped to a 1ch square, like the heatmap. With the default `shade` look, whole cells are `▓`, a part-filled top is `▒` or `░`, empty track is a dim `·`, and the scrubbed group turns solid `█` while the rest fade back. Other looks swap in their own five glyphs, so `dollar` stacks `$` with `.` and `¢` for a part-filled top."],
      ["Glyphs", "`columnGlyphs` is exported. Add your own preset to it, or pass a five-glyph string straight to `glyphs`. Pick glyphs your font has, since a fallback font may draw them at another size."],
      ["Motion", "Bars stack up one block at a time from the baseline, 40ms per block, each bar starting 30ms after the last (capped at 360ms). Off under `prefers-reduced-motion`."],
      ["Sizing", "Cells scale with the font size, so set `text-sm` or larger for chunky blocks. Labels that would collide are thinned out."],
      ["Bar chart", "For horizontal bars with labels on the left, use `AsciiBarChart` from ASCII Chart."],
      ["Dependencies", "`motion` for the entrance and transitions."],
    ],
  },
  "ascii-pie-chart": {
    usage: `import { AsciiPieChart } from "@/components/ascii/ascii-pie-chart"

<AsciiPieChart
  label="Traffic by browser"
  data={[
    { label: "chrome", value: 64 },
    { label: "safari", value: 19 },
    { label: "firefox", value: 9 },
  ]}
/>`,
    props: [
      ["data", "{ label, value, className? }[]", "—", "One slice per entry, clockwise from twelve o'clock. `className` colours it; otherwise a six-colour palette in turn."],
      ["label", "string", "—", "Names the chart for screen readers and captions its data table."],
      ["width", "number", "24", "Diameter in characters. It is half as many rows tall, since braille dots come out square."],
      ["innerRadius", "number", "0", "Hole size from 0 to 1. Above 0 it becomes a donut with the total, or the active slice, in the middle."],
      ["legend", "boolean", "true", "List each slice with its value and share."],
      ["format", "(v) => string", "String", "Formats values in the legend, the middle and the data table."],
      ["animate", "boolean", "true", "Sweep the slices in clockwise the first time the chart scrolls into view."],
    ],
    examples: [
      {
        id: "donut",
        title: "A donut with a total",
        description: "`innerRadius` hollows the pie out and puts the total in the middle. Hover a slice and the middle shows that slice instead.",
        code: `<AsciiPieChart
  label="Storage"
  data={[
    { label: "photos", value: 112 },
    { label: "video", value: 64, className: "text-sky-500" },
    { label: "apps", value: 38, className: "text-amber-500" },
  ]}
  innerRadius={0.6}
  format={(v) => \`\${v}GB\`}
/>`,
      },
    ],
    notes: [
      ["Accessibility", "A focusable group named by `label`. Arrow keys step through slices, Escape clears, and a live region reads the slice, its value and share. A visually hidden table holds every slice."],
      ["Interaction", "Hovering a slice or its legend row pops it out along its middle and fades the rest."],
      ["Motion", "The sweep runs 0.9s with a strong ease-out the first time the chart is 40% in view. The pop and fade take 0.2s. Under `prefers-reduced-motion` the chart appears whole and nothing moves."],
      ["Geometry", "`pie()` is exported and returns one braille layer per slice plus each slice's cumulative end, for custom layouts."],
      ["Dependencies", "`motion` for the sweep and transitions."],
    ],
  },
  "ascii-heatmap": {
    usage: `import { AsciiHeatmap } from "@/components/ascii/ascii-heatmap"

<AsciiHeatmap
  label="Contributions"
  data={[{ date: "2026-10-26", value: 4 }, { date: "2026-10-25", value: 1 }]}
  className="text-primary"
/>`,
    props: [
      ["data", "{ date, value }[]", "—", "One entry per day, `date` as `YYYY-MM-DD`. Missing days count as 0."],
      ["label", "string", "—", "Names the chart for screen readers."],
      ["weeks", "number", "53", "Columns to show, ending on the week of `end`. The oldest are dropped when the container is too narrow."],
      ["end", "string | Date", "latest date", "Last day shown. Later days in that week stay empty."],
      ["max", "number", "largest value", "Value that gets the darkest shade. Set it to compare several heatmaps fairly."],
      ["format", "(value, date) => string", "\"4 on Mon, Oct 26, 2026\"", "Readout for the hovered or focused day."],
      ["legend", "boolean", "true", "Show the less to more key."],
      ["glyphs", "string", "\"shade\"", "How the days look: `shade`, `hash`, `dollar`, `diamond` or `circle`, or any five glyphs from nothing to the busiest day."],
      ["animate", "boolean", "true", "Ripple the days in from the top left the first time the grid scrolls into view."],
    ],
    examples: [
      {
        id: "habit",
        title: "A habit tracker",
        description: "Twelve weeks and a fixed `max` turn it into a training log. `formatDay` is exported for readouts.",
        code: `import { AsciiHeatmap, formatDay } from "@/components/ascii/ascii-heatmap"

<AsciiHeatmap
  label="Running"
  data={runs}
  weeks={12}
  max={10}
  format={(km, date) => \`\${km} km on \${formatDay(date)}\`}
  className="text-sm text-sky-500"
/>`,
      },
    ],
    notes: [
      ["Accessibility", "A focusable group named by `label`. Arrow keys walk the days, Escape clears, and the readout is a live region."],
      ["Shades", "Five levels: `·` for nothing, then `░▒▓█` in even steps up to `max`, or the five glyphs of another look from `heatmapGlyphs`. Each glyph is clipped to a 1ch square, so cells stay square and evenly spaced in any font."],
      ["Sizing", "Fills its container's width and shows as many of the latest `weeks` as fit, so a full year narrows to recent months on a phone."],
      ["Dates", "Handled as UTC days, so the grid never shifts with the viewer's time zone. Weeks start on Sunday."],
      ["Motion", "Each day scales and fades in with a delay that grows along the diagonal, once. Under `prefers-reduced-motion` the grid appears finished."],
      ["Dependencies", "`motion` for the entrance."],
    ],
  },
  "ascii-gauge": {
    usage: `import { AsciiGauge } from "@/components/ascii/ascii-gauge"

<AsciiGauge value={64} label="cpu" format={(v) => \`\${v}%\`} />`,
    props: [
      ["value", "number", "—", "Clamped to `min` and `max`."],
      ["label", "string", "—", "Names the meter and is shown under the value."],
      ["min / max", "number", "0 / 100", "Range of the dial."],
      ["width", "number", "24", "Width in characters. The height follows from the sweep."],
      ["sweep", "number", "270", "Arc length in degrees: 270 for a dial, 180 for a half circle."],
      ["ticks", "number", "0", "Divisions marked around the outside."],
      ["thickness", "number", "auto", "Arc thickness in braille dots."],
      ["format", "(v) => string", "rounded", "Formats the value and the range labels."],
      ["indicatorClassName", "string", "\"text-primary\"", "Colour of the filled arc. Swap it at a threshold for warnings."],
      ["showRange", "boolean", "true", "Show `min` and `max` under the ends of the arc."],
    ],
    examples: [
      {
        id: "half",
        title: "Half circles with ticks",
        description: "`sweep={180}` gives a flatter gauge that sits well in a row. Colour the arc by threshold with `indicatorClassName`.",
        code: `<AsciiGauge
  value={93}
  label="storage"
  sweep={180}
  ticks={4}
  width={20}
  indicatorClassName={value >= 85 ? "text-destructive" : "text-primary"}
/>`,
      },
    ],
    notes: [
      ["Accessibility", "`role=\"meter\"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and the formatted value as `aria-valuetext`. The braille is hidden from screen readers."],
      ["Precision", "The arc is drawn on the braille dot grid, 2×4 dots per character. Dots come out round at line-height 1.2 in a 0.6em-wide monospace font."],
      ["Geometry", "`gauge()` is exported and returns the text layers plus the centre and radii in dots, for custom labels."],
      ["Dependencies", "None. Plain text, safe in Server Components."],
    ],
  },
  "ascii-uptime": {
    usage: `import { AsciiUptime } from "@/components/ascii/ascii-uptime"

<AsciiUptime
  label="API"
  data={[
    { label: "Oct 24", status: "up" },
    { label: "Oct 25", status: "degraded", note: "Slow responses in eu-west" },
    { label: "Oct 26", status: "up" },
  ]}
/>`,
    props: [
      ["data", "{ label, status, note? }[]", "—", "One entry per interval, oldest first. `status` is `\"up\"`, `\"degraded\"`, `\"down\"` or `\"none\"`. The oldest are dropped when the container is too narrow."],
      ["label", "string", "—", "Service name, shown above the bars and announced with the uptime."],
      ["uptime", "number", "computed", "Overall percentage. Defaults to `uptimePercent()` of the intervals shown."],
      ["rows", "number", "2", "Bar height in cells."],
      ["glyphs", "string", "\"shade\"", "How the cells look: `shade`, `hash`, `dollar`, `diamond` or `circle`, or any five glyphs: no data, unused, operational, degraded, outage. Same presets as the column chart."],
      ["legend", "boolean", "true", "Show the status key. Turn it off for all but the last service on a status page."],
      ["summary", "boolean", "true", "Show the name and current status above the bars, and the date range and uptime below. Without it, each bar gets a native tooltip."],
    ],
    examples: [
      {
        id: "compact",
        title: "Compact rows",
        description: "`rows={1}`, `legend={false}` and `summary={false}` leave only the bars. Put them in a column that has a width, such as `1fr` in a grid. `uptimePercent()` is exported for your own columns.",
        code: `<div className="grid grid-cols-[auto_1fr_auto] gap-x-6">
  {services.map((s) => (
    <Fragment key={s.name}>
      <span>{s.name}</span>
      <AsciiUptime label={s.name} data={s.days} rows={1} legend={false} summary={false} />
      <span>{uptimePercent(s.days).toFixed(1)}%</span>
    </Fragment>
  ))}
</div>`,
      },
    ],
    notes: [
      ["Accessibility", "A focusable group named with the service and its uptime, plus a hidden summary of outages. Arrow keys step through intervals, and the readout is a live region."],
      ["Status", "Every bar is full height, so even one-row bars show plenty of colour. Worse days use denser glyphs (`▒` up, `▓` degraded, `█` outage, `·` no data with `shade`), so incidents stand out and read without colour vision. Each cell is exactly 1em tall with no gap, so the rows of a bar merge into one solid column. Edit `uptimeStatuses` to change labels, colours or which glyph each status uses."],
      ["Sizing", "Fills its container's width and shows as many of the latest intervals as fit, so 90 days narrow to the last few weeks on a phone."],
      ["Uptime", "Counts up and degraded intervals as available and leaves out intervals with no data. Pass `uptime` for a figure from your monitoring."],
      ["Motion", "Hovering dims the other bars with a short fade, which is off under `prefers-reduced-motion`."],
      ["Dependencies", "None. Plain text and React state."],
    ],
  },
}
