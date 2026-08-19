import {
  LayoutDashboardIcon,
  Building2Icon,
  CreditCardIcon,
  ActivityIcon,
  SettingsIcon,
  LifeBuoyIcon,
} from "lucide-react"

import { ROUTES } from "@/lib/constants/routes"
import type { NavItem } from "@/lib/navigation/types"

export const platformNav: NavItem[] = [
  { title: "Dashboard", href: ROUTES.platform.dashboard, icon: LayoutDashboardIcon },
  { title: "Tenants", href: ROUTES.platform.tenants, icon: Building2Icon },
  { title: "Plans & billing", href: ROUTES.platform.billing, icon: CreditCardIcon },
  { title: "Usage monitoring", href: ROUTES.platform.usage, icon: ActivityIcon },
  { title: "Global settings", href: ROUTES.platform.settings, icon: SettingsIcon },
  { title: "Support tools", href: ROUTES.platform.support, icon: LifeBuoyIcon },
]
