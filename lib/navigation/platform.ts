import {
  UsersIcon,
  CreditCardIcon,
} from "lucide-react"

import { ROUTES } from "@/lib/constants/routes"
import type { NavItem } from "@/lib/navigation/types"

export const platformNav: NavItem[] = [
  { title: "User Management", href: ROUTES.superAdmin.users, icon: UsersIcon },
  {
    title: "Subscription Management",
    href: ROUTES.superAdmin.subscriptions,
    icon: CreditCardIcon,
  },
]
