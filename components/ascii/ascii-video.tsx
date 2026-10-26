"use client"

import { useEffect, useEffectEvent, useState } from "react"

import { AsciiCanvas, type AsciiCanvasProps } from "@/lib/ascii"
import { cn } from "@/lib/utils"

export type AsciiVideoProps = Omit<AsciiCanvasProps, "source" | "mirror"> & {
  /** A video URL, a MediaStream, or "webcam" to ask for the user's camera. */
  src: string | MediaStream
  /** Mirror horizontally. Defaults to true for the webcam. */
  mirror?: boolean
  onError?: (error: unknown) => void
}

export function AsciiVideo({ src, mirror, onError, className, ...props }: AsciiVideoProps) {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null)
  const [aspect, setAspect] = useState(16 / 9)
  const fail = useEffectEvent((error: unknown) => onError?.(error))

  useEffect(() => {
    const el = document.createElement("video")
    el.muted = true
    el.loop = true
    el.playsInline = true
    el.crossOrigin = "anonymous"
    let stream: MediaStream | null = null
    let cancelled = false

    el.onloadeddata = () => {
      setAspect(el.videoWidth / el.videoHeight)
      setVideo(el)
      el.play().catch(fail)
    }

    if (src === "webcam") {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user" } })
        .then((s) => {
          if (cancelled) return s.getTracks().forEach((t) => t.stop())
          stream = s
          el.srcObject = s
        })
        .catch(fail)
    } else if (typeof src === "string") {
      el.src = src
    } else {
      el.srcObject = src
    }

    return () => {
      cancelled = true
      el.pause()
      el.onloadeddata = null
      stream?.getTracks().forEach((t) => t.stop())
      setVideo(null)
    }
  }, [src])

  return (
    <div className={cn("relative w-full overflow-hidden", className)} style={{ aspectRatio: aspect }}>
      <AsciiCanvas source={video} mirror={mirror ?? src === "webcam"} className="absolute inset-0" {...props} />
    </div>
  )
}
