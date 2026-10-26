import type { Metadata } from "next"
import { Geist, Geist_Mono, IBM_Plex_Mono, Instrument_Serif } from "next/font/google"

import { SiteHeader } from "@/components/site/site-header"

import "./globals.css"

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] })
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
})
const plexMono = IBM_Plex_Mono({ variable: "--font-plex", subsets: ["latin"], weight: ["400", "700"] })
// Geist Mono has no block or braille glyphs; fall back to monospace faces that do instead of a metric-adjusted Arial.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  adjustFontFallback: false,
  fallback: ["ui-monospace", "Cascadia Mono", "Menlo", "Consolas", "DejaVu Sans Mono", "monospace"],
})

export const metadata: Metadata = {
  title: { default: "asciicn — ASCII components for shadcn/ui", template: "%s · asciicn" },
  description:
    "An ASCII engine and copy-paste components for React and shadcn/ui. Images, video, backgrounds, text and terminal UI, all drawn in characters.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${plexMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
