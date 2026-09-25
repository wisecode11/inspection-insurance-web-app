import Image from "next/image"

import { cn } from "@/lib/utils"

export const ICONS_3D = {
  camera: "/icons/3d/camera.png?v=2",
  headphones: "/icons/3d/headphones.png?v=2",
  shield: "/icons/3d/shield.png?v=2",
  zap: "/icons/3d/zap.png?v=2",
  clipboard: "/icons/3d/clipboard.png?v=2",
  weather: "/icons/3d/weather.png?v=2",
  file: "/icons/3d/file.png?v=2",
  users: "/icons/3d/users.png?v=2",
  briefcase: "/icons/3d/briefcase.png?v=2",
  check: "/icons/3d/check.png?v=2",
  alert: "/icons/3d/alert.png?v=2",
  dashboard: "/icons/3d/dashboard.png?v=2",
  palette: "/icons/3d/palette.png?v=2",
  platform: "/icons/3d/platform.png?v=2",
} as const

export type Icon3DKey = keyof typeof ICONS_3D

/** Photoreal 3D icon asset for marketing + admin surfaces. */
export function Icon3D({
  name,
  className,
  size = 88,
  priority,
}: {
  name: Icon3DKey
  className?: string
  size?: number
  priority?: boolean
}) {
  return (
    <Image
      src={ICONS_3D[name]}
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={cn(
        "object-contain drop-shadow-[0_10px_18px_rgba(16,24,40,0.16)] select-none",
        className,
      )}
    />
  )
}
