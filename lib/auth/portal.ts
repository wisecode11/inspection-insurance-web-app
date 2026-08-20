import type { UserRole } from "@/types/role"
import type { Role } from "@/types/role"
import type { AuthUser } from "@/types/user"

export function toPortalRole(role: UserRole): Role | null {
  if (role === "platform_admin") return "platform"
  if (role === "company_admin" || role === "office_staff") return "company"
  return null
}

export function displayName(user: AuthUser) {
  const name = `${user.profile.firstName} ${user.profile.lastName}`.trim()
  return name || user.email
}

export function initials(user: AuthUser) {
  const first = user.profile.firstName?.[0] || ""
  const last = user.profile.lastName?.[0] || ""
  const value = `${first}${last}`.toUpperCase()
  return value || user.email.slice(0, 2).toUpperCase()
}
