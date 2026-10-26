import { llmsIndex } from "@/lib/markdown"

export function GET() {
  return new Response(llmsIndex(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } })
}
