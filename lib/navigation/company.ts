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
import type { NavGroup, NavItem } from "@/lib/navigation/types"
import type { UserRole } from "@/types/role"

export const companyNavGroups: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { title: "Dashboard", href: ROUTES.company.dashboard, icon: LayoutDashboardIcon },
      { title: "Jobs", href: ROUTES.company.jobs, icon: ClipboardListIcon },
      { title: "Reports", href: ROUTES.company.reports, icon: FileTextIcon },
      { title: "Analytics", href: ROUTES.company.analytics, icon: BarChart3Icon },
    ],
  },
  {
    label: "Team",
    items: [
      { title: "Staff", href: ROUTES.company.staff, icon: UsersIcon },
      { title: "Organization", href: ROUTES.company.organization, icon: Building2Icon },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "Subscription", href: ROUTES.company.billing, icon: CreditCardIcon },
      { title: "Codes & standards", href: ROUTES.company.codes, icon: BookMarkedIcon },
      { title: "Branding", href: ROUTES.company.branding, icon: PaletteIcon },
      { title: "Report language", href: ROUTES.company.templates, icon: FileStackIcon },
    ],
  },
]

/** Flat list — kept for backwards compatibility. */
export const companyNav: NavItem[] = companyNavGroups.flatMap((group) => group.items)

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

export function companyNavGroupsForUserRole(userRole?: UserRole | null): NavGroup[] {
  const allowed = new Set(companyNavForUserRole(userRole).map((item) => item.href))
  return companyNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => allowed.has(item.href)),
    }))
    .filter((group) => group.items.length > 0)
}
