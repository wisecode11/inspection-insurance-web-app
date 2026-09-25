import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  FileTextIcon,
  BarChart3Icon,
  UsersIcon,
  Building2Icon,
  CreditCardIcon,
  PaletteIcon,
  BookOpenIcon,
  LanguagesIcon,
} from "lucide-react"

import { ROUTES } from "@/lib/constants/routes"
import type { NavGroup, NavItem } from "@/lib/navigation/types"
import type { UserRole } from "@/types/role"

/**
 * Company top-bar nav (Wise Studio-style secondary row).
 * Groups with a single item whose title matches the group label render as a
 * direct tab (e.g. Dashboard). All other groups render as dropdowns.
 */
export const companyNavGroups: NavGroup[] = [
  {
    label: "Dashboard",
    items: [
      {
        title: "Dashboard",
        href: ROUTES.company.dashboard,
        icon: LayoutDashboardIcon,
        icon3d: "dashboard",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        title: "Jobs",
        href: ROUTES.company.jobs,
        icon: ClipboardListIcon,
        icon3d: "clipboard",
      },
    ],
  },
  {
    label: "Team",
    items: [
      {
        title: "Staff",
        href: ROUTES.company.staff,
        icon: UsersIcon,
        icon3d: "users",
      },
      {
        title: "Organization",
        href: ROUTES.company.organization,
        icon: Building2Icon,
        icon3d: "briefcase",
      },
    ],
  },
  {
    label: "Configurations",
    items: [
      {
        title: "Subscription",
        href: ROUTES.company.billing,
        icon: CreditCardIcon,
        icon3d: "file",
      },
      {
        title: "Branding",
        href: ROUTES.company.branding,
        icon: PaletteIcon,
        icon3d: "palette",
      },
      {
        title: "Codes & standards",
        href: ROUTES.company.codes,
        icon: BookOpenIcon,
        icon3d: "clipboard",
      },
    ],
  },
  {
    label: "Reports & Analytics",
    items: [
      {
        title: "Reports",
        href: ROUTES.company.reports,
        icon: FileTextIcon,
        icon3d: "file",
      },
      {
        title: "Analytics",
        href: ROUTES.company.analytics,
        icon: BarChart3Icon,
        icon3d: "dashboard",
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Report language",
        href: ROUTES.company.templates,
        icon: LanguagesIcon,
        icon3d: "file",
      },
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
