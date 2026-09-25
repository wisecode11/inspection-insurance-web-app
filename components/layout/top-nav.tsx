"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3Icon,
  BriefcaseIcon,
  ChevronDownIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import { motion } from "framer-motion"

import { Icon3D, type Icon3DKey } from "@/components/shared/icon-3d"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  companyNavGroupsForUserRole,
  isStandaloneNavGroup,
} from "@/lib/navigation/company"
import { getStoredUser } from "@/lib/auth/user-storage"
import { cn } from "@/lib/utils"

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

function groupIsActive(pathname: string, hrefs: string[]) {
  return hrefs.some((href) => pathMatches(pathname, href))
}

const GROUP_ICONS: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboardIcon,
  Operations: BriefcaseIcon,
  Team: UsersIcon,
  Configurations: Settings2Icon,
  "Reports & Analytics": BarChart3Icon,
  Settings: SettingsIcon,
}

const GROUP_ICONS_3D: Record<string, Icon3DKey> = {
  Dashboard: "dashboard",
  Operations: "briefcase",
  Team: "users",
  Configurations: "shield",
  "Reports & Analytics": "file",
  Settings: "file",
}

const itemBase =
  "relative inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-[13px] font-medium transition-colors"

/** Horizontal enterprise nav for the dark ops header. */
export function TopNav({ badgeCount = 0 }: { badgeCount?: number }) {
  const pathname = usePathname()
  const user = typeof window !== "undefined" ? getStoredUser() : null
  const groups = companyNavGroupsForUserRole(user?.role)

  return (
    <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
      {groups.map((group) => {
        const hrefs = group.items.map((item) => item.href)
        const active = groupIsActive(pathname, hrefs)
        const Icon = GROUP_ICONS[group.label] ?? group.items[0]?.icon
        const icon3d = GROUP_ICONS_3D[group.label] ?? group.items[0]?.icon3d
        const showBadge = group.label === "Operations" && badgeCount > 0

        const label = (
          <>
            {icon3d ? (
              <Icon3D
                name={icon3d}
                size={18}
                className="shrink-0 drop-shadow-none opacity-95"
              />
            ) : Icon ? (
              <Icon className="size-3.5 shrink-0 opacity-90" aria-hidden />
            ) : null}
            <span>{group.label}</span>
            {showBadge ? (
              <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#12B76A] px-1 text-[10px] font-bold text-white">
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            ) : !isStandaloneNavGroup(group) ? (
              <ChevronDownIcon className="size-3 opacity-50" aria-hidden />
            ) : null}
          </>
        )

        if (isStandaloneNavGroup(group)) {
          const item = group.items[0]
          return (
            <Link
              key={group.label}
              href={item.href}
              className={cn(
                itemBase,
                active ? "bg-white/[0.08] text-white" : "text-white/70 hover:bg-white/[0.06] hover:text-white",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-[10px] bg-white/[0.08]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <span className="relative z-10 inline-flex items-center gap-2">{label}</span>
            </Link>
          )
        }

        return (
          <DropdownMenu key={group.label}>
            <DropdownMenuTrigger
              openOnHover
              delay={80}
              closeDelay={140}
              render={
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    itemBase,
                    "shadow-none",
                    active
                      ? "bg-white/[0.08] text-white hover:bg-white/[0.08] hover:text-white"
                      : "text-white/70 hover:bg-white/[0.06] hover:text-white data-popup-open:bg-white/[0.06] data-popup-open:text-white",
                  )}
                >
                  {label}
                </Button>
              }
            />
            <DropdownMenuContent
              align="start"
              sideOffset={12}
              className="min-w-[14rem] rounded-xl border border-[#E6E9E7] bg-white p-1.5 shadow-[0_12px_40px_-12px_rgba(16,24,40,0.18)]"
            >
              {group.items.map((item) => {
                const itemActive = pathMatches(pathname, item.href)
                return (
                  <DropdownMenuItem
                    key={item.href}
                    className={cn(
                      "cursor-pointer gap-2.5 rounded-lg px-2.5 py-2.5 text-sm",
                      itemActive && "bg-[#E8F5EF] font-medium text-[#063728]",
                    )}
                    render={<Link href={item.href} />}
                  >
                    {item.icon3d ? (
                      <Icon3D
                        name={item.icon3d}
                        size={22}
                        className="shrink-0 drop-shadow-[0_4px_8px_rgba(16,24,40,0.12)]"
                      />
                    ) : (
                      <item.icon className="size-4 text-[#0A4B37]" />
                    )}
                    {item.title}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      })}
    </nav>
  )
}
