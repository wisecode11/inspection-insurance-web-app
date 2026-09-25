import type { LucideIcon } from "lucide-react"

import type { Icon3DKey } from "@/components/shared/icon-3d"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  /** Photoreal 3D icon for larger nav surfaces (dropdowns, mobile, icon rail). */
  icon3d?: Icon3DKey
}

export type NavGroup = {
  label: string
  items: NavItem[]
}
