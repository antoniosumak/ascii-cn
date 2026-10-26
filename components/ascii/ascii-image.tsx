"use client"

import { useEffect, useState } from "react"

import { AsciiCanvas, type AsciiCanvasProps } from "@/lib/ascii"
import { cn } from "@/lib/utils"

export type AsciiImageProps = Omit<AsciiCanvasProps, "source"> & {
  src: string
  alt: string
  /** Cross-fade to the original photo on hover. */
  reveal?: boolean
}

export function AsciiImage({ src, alt, reveal = false, className, ...props }: AsciiImageProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => setImage(img)
    img.src = src
    return () => {
      img.onload = null
    }
  }, [src])

  return (
    <div
      className={cn("group relative w-full overflow-hidden", className)}
      style={{ aspectRatio: image ? `${image.naturalWidth} / ${image.naturalHeight}` : "1" }}
    >
      <AsciiCanvas source={image} aria-label={alt} className="absolute inset-0" {...props} />
      {reveal && (
        // eslint-disable-next-line @next/next/no-img-element -- crossfade target must be the same file the canvas samples
        <img
          src={src}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )}
    </div>
  )
}
