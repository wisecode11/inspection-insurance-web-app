"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldIcon } from "lucide-react"

import { companyIconRailForUserRole } from "@/lib/navigation/company"
import { getStoredUser } from "@/lib/auth/user-storage"
import { ROUTES } from "@/lib/constants/routes"
import { COMPANY_ICON_RAIL_CLASS } from "@/lib/constants/layout"
import { cn } from "@/lib/utils"

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

/**
 * Thin circular icon rail — solid primary green chrome for brand presence.
 */
export function CompanyIconRail() {
  const pathname = usePathname()
  const user = typeof window !== "undefined" ? getStoredUser() : null
  const items = companyIconRailForUserRole(user?.role)

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col items-center gap-3 bg-primary py-4 text-primary-foreground md:flex",
        COMPANY_ICON_RAIL_CLASS,
      )}
      aria-label="Quick navigation"
    >
      <Link
        href={ROUTES.company.dashboard}
        aria-label="RoofClaim home"
        className="mb-1 flex size-11 items-center justify-center rounded-full bg-white/15 text-white shadow-sm ring-1 ring-white/20 transition-colors hover:bg-white/25"
      >
        <ShieldIcon className="size-5" />
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-2 overflow-y-auto px-2 py-1">
        {items.map((item) => {
          const active = pathMatches(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.title}
              aria-label={item.title}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex size-11 items-center justify-center rounded-full transition-colors",
                active
                  ? "bg-white text-primary shadow-sm"
                  : "text-white/75 hover:bg-white/15 hover:text-white",
              )}
            >
              <item.icon className="size-[18px]" />
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
