import { llmsFull } from "@/lib/markdown"

export function GET() {
  return new Response(llmsFull(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } })
}
