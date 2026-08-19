import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  UsersIcon,
  PaletteIcon,
  FileStackIcon,
  BarChart3Icon,
} from "lucide-react"

import { ROUTES } from "@/lib/constants/routes"
import type { NavItem } from "@/lib/navigation/types"

export const companyNav: NavItem[] = [
  { title: "Dashboard", href: ROUTES.company.dashboard, icon: LayoutDashboardIcon },
  { title: "Jobs & reports", href: ROUTES.company.jobs, icon: ClipboardListIcon },
  { title: "Staff", href: ROUTES.company.staff, icon: UsersIcon },
  { title: "Branding", href: ROUTES.company.branding, icon: PaletteIcon },
  { title: "Templates & checklists", href: ROUTES.company.templates, icon: FileStackIcon },
  { title: "Analytics", href: ROUTES.company.analytics, icon: BarChart3Icon },
]
