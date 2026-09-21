import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  UsersIcon,
  CreditCardIcon,
} from "lucide-react"

import { ROUTES } from "@/lib/constants/routes"
import type { NavGroup, NavItem } from "@/lib/navigation/types"
import type { UserRole } from "@/types/role"

/**
 * Company top-bar nav.
 * Groups with a single item whose title matches the group label render as a
 * direct tab (e.g. Dashboard). All other groups render as dropdowns.
 *
 * Visible items kept in sync with the trimmed company nav set:
 * Dashboard, Jobs, Staff, Subscription.
 */
export const companyNavGroups: NavGroup[] = [
  {
    label: "Dashboard",
    items: [
      { title: "Dashboard", href: ROUTES.company.dashboard, icon: LayoutDashboardIcon },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Jobs", href: ROUTES.company.jobs, icon: ClipboardListIcon },
    ],
  },
  {
    label: "Team",
    items: [
      { title: "Staff", href: ROUTES.company.staff, icon: UsersIcon },
    ],
  },
  {
    label: "Configurations",
    items: [
      { title: "Subscription", href: ROUTES.company.billing, icon: CreditCardIcon },
    ],
  },
]

/** Flat list — kept for backwards compatibility. */
export const companyNav: NavItem[] = companyNavGroups.flatMap((group) => group.items)

/** Office staff see operational items only (no org admin surfaces). */
const OFFICE_STAFF_HREFS = new Set<string>([
  ROUTES.company.dashboard,
  ROUTES.company.jobs,
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

/** True when the group should render as a single top-level link (no dropdown). */
export function isStandaloneNavGroup(group: NavGroup): boolean {
  return group.items.length === 1 && group.items[0].title === group.label
}

/** Compact icon-rail destinations (admin dashboard quick jumps). */
const ICON_RAIL_HREFS = [
  ROUTES.company.dashboard,
  ROUTES.company.jobs,
  ROUTES.company.staff,
  ROUTES.company.billing,
] as const

export function companyIconRailForUserRole(userRole?: UserRole | null): NavItem[] {
  const allowed = new Set(companyNavForUserRole(userRole).map((item) => item.href))
  const byHref = new Map(companyNav.map((item) => [item.href, item]))
  return ICON_RAIL_HREFS.flatMap((href) => {
    const item = byHref.get(href)
    return item && allowed.has(item.href) ? [item] : []
  })
}
