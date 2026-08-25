import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  UsersIcon,
  PaletteIcon,
  FileStackIcon,
  BarChart3Icon,
  Building2Icon,
  BookMarkedIcon,
  CreditCardIcon,
  FileTextIcon,
} from "lucide-react"

import { ROUTES } from "@/lib/constants/routes"
import type { NavItem } from "@/lib/navigation/types"
import type { UserRole } from "@/types/role"

export const companyNav: NavItem[] = [
  { title: "Dashboard", href: ROUTES.company.dashboard, icon: LayoutDashboardIcon },
  { title: "Jobs", href: ROUTES.company.jobs, icon: ClipboardListIcon },
  // { title: "Reports", href: ROUTES.company.reports, icon: FileTextIcon },
  { title: "Staff", href: ROUTES.company.staff, icon: UsersIcon },
  { title: "Organization", href: ROUTES.company.organization, icon: Building2Icon },
  { title: "Subscription", href: ROUTES.company.billing, icon: CreditCardIcon },
  // { title: "Codes & standards", href: ROUTES.company.codes, icon: BookMarkedIcon },
  // { title: "Branding", href: ROUTES.company.branding, icon: PaletteIcon },
  // { title: "Report language", href: ROUTES.company.templates, icon: FileStackIcon },
  // { title: "Analytics", href: ROUTES.company.analytics, icon: BarChart3Icon },
]

/** Office staff see operational items only (no org admin surfaces). */
const OFFICE_STAFF_HREFS = new Set<string>([
  ROUTES.company.dashboard,
  ROUTES.company.jobs,
  ROUTES.company.reports,
  ROUTES.company.organization,
  ROUTES.company.analytics,
])

export function companyNavForUserRole(userRole?: UserRole | null): NavItem[] {
  if (userRole === "office_staff") {
    return companyNav.filter((item) => OFFICE_STAFF_HREFS.has(item.href))
  }
  return companyNav
}
