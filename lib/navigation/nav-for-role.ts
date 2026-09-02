import { companyNavForUserRole, companyNavGroupsForUserRole } from "@/lib/navigation/company"
import { platformNav } from "@/lib/navigation/platform"
import type { NavGroup, NavItem } from "@/lib/navigation/types"
import type { Role, UserRole } from "@/types/role"

export function navForRole(role: Role, userRole?: UserRole | null): NavItem[] {
  if (role === "platform") return platformNav
  return companyNavForUserRole(userRole)
}

export function navGroupsForRole(role: Role, userRole?: UserRole | null): NavGroup[] {
  if (role === "platform") {
    return [{ label: "Platform", items: platformNav }]
  }
  return companyNavGroupsForUserRole(userRole)
}
