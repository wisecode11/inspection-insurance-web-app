import type { Role } from "@/types/role"

export const roleMeta: Record<Role, { label: string; org: string; sub: string }> = {
  platform: {
    label: "Super Admin",
    org: "RoofClaim HQ",
    sub: "SaaS owner console",
  },
  company: {
    label: "Company Admin",
    org: "Summit Ridge Roofing",
    sub: "Company workspace",
  },
}
