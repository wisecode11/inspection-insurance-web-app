import { companyNav } from "@/lib/navigation/company"
import { platformNav } from "@/lib/navigation/platform"
import type { NavItem } from "@/lib/navigation/types"
import type { Role } from "@/types/role"

export function navForRole(role: Role): NavItem[] {
  return role === "platform" ? platformNav : companyNav
}
