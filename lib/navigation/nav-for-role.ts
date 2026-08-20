import { companyNavForUserRole } from "@/lib/navigation/company"
import { platformNav } from "@/lib/navigation/platform"
import type { NavItem } from "@/lib/navigation/types"
import type { Role, UserRole } from "@/types/role"

export function navForRole(role: Role, userRole?: UserRole | null): NavItem[] {
  if (role === "platform") return platformNav
  return companyNavForUserRole(userRole)
}
