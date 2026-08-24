import { ROUTES } from "@/lib/constants/routes"
import type { Role } from "@/types/role"

export const roleDestinations: Record<Role, string> = {
  platform: ROUTES.superAdmin.users,
  company: ROUTES.company.dashboard,
}
