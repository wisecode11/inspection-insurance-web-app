import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

type Blob = {
  className: string
  style: CSSProperties & Record<`--${string}`, string>
}

/** Deep forest aurora for the visual panel. */
const NIGHT: Blob[] = [
  {
    className: "left-[-10%] top-[-15%] size-[60%] bg-[#0f8f5a]/45",
    style: { "--auth-dur": "26s", "--auth-dx": "18%", "--auth-dy": "12%" },
  },
  {
    className: "right-[-15%] top-[20%] size-[55%] bg-[#0e7490]/35",
    style: { "--auth-dur": "31s", "--auth-dx": "-14%", "--auth-dy": "10%", "--auth-delay": "-8s" },
  },
  {
    className: "bottom-[-25%] left-[15%] size-[65%] bg-[#12b76a]/30",
    style: { "--auth-dur": "24s", "--auth-dx": "10%", "--auth-dy": "-16%", "--auth-delay": "-4s" },
  },
  {
    className: "left-[35%] top-[30%] size-[30%] bg-[#6ae8b0]/20",
    style: { "--auth-dur": "19s", "--auth-dx": "-20%", "--auth-dy": "-12%", "--auth-delay": "-12s" },
  },
]

/** Light, airy aurora behind the form (muted in dark mode). */
const PAGE: Blob[] = [
  {
    className: "right-[-10%] top-[-20%] size-[55%] bg-[#8ce0b0]/45 dark:bg-[#0f8f5a]/25",
    style: { "--auth-dur": "28s", "--auth-dx": "-12%", "--auth-dy": "14%" },
  },
  {
    className: "bottom-[-20%] right-[10%] size-[50%] bg-[#a5e4f3]/40 dark:bg-[#0e7490]/20",
    style: { "--auth-dur": "33s", "--auth-dx": "14%", "--auth-dy": "-10%", "--auth-delay": "-10s" },
  },
  {
    className: "left-[-10%] top-[30%] size-[45%] bg-[#d9f99d]/35 dark:bg-[#12b76a]/15",
    style: { "--auth-dur": "25s", "--auth-dx": "16%", "--auth-dy": "8%", "--auth-delay": "-6s" },
  },
]

/**
 * Living mesh-gradient backdrop: blurred colour fields drifting on long,
 * offset loops plus slow light beams. CSS-only, so it costs no JS frames.
 */
export function AuthAurora({ tone, className }: { tone: "night" | "page"; className?: string }) {
  const blobs = tone === "night" ? NIGHT : PAGE
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {blobs.map((blob, i) => (
        <span key={i} className={cn("auth-aurora-blob", blob.className)} style={blob.style} />
      ))}
      {tone === "night" && (
        <>
          <span className="auth-beam" style={{ "--auth-dur": "13s" } as CSSProperties} />
          <span className="auth-beam" style={{ "--auth-dur": "17s", "--auth-delay": "-7s" } as CSSProperties} />
          {/* Fine grid, masked to the centre */}
          <span className="absolute inset-0 bg-[linear-gradient(rgba(140,224,176,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(140,224,176,0.06)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_45%,black,transparent)] bg-[size:44px_44px]" />
        </>
      )}
      {tone === "page" && (
        <span className="absolute inset-0 bg-[radial-gradient(rgba(10,75,55,0.07)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] bg-[size:22px_22px] dark:bg-[radial-gradient(rgba(140,224,176,0.06)_1px,transparent_1px)]" />
      )}
    </div>
  )
}
