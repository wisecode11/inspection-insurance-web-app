"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDownIcon } from "lucide-react"

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

const pillBase =
  "inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-sm font-medium shadow-none transition-all duration-200"

const pillIdle =
  "bg-transparent text-white/80 hover:bg-white/10 hover:text-white data-popup-open:bg-white/10 data-popup-open:text-white"

const pillActive =
  "bg-[#e8ece9] text-primary-dark hover:bg-[#e8ece9] hover:text-primary-dark data-popup-open:bg-[#e8ece9] data-popup-open:text-primary-dark"

/** Green-bar nav — light active chip, white idle text, hover dropdowns. */
export function TopNav() {
  const pathname = usePathname()
  const user = typeof window !== "undefined" ? getStoredUser() : null
  const groups = companyNavGroupsForUserRole(user?.role)

  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      {groups.map((group) => {
        const hrefs = group.items.map((item) => item.href)
        const active = groupIsActive(pathname, hrefs)

        if (isStandaloneNavGroup(group)) {
          const item = group.items[0]
          return (
            <Link
              key={group.label}
              href={item.href}
              className={cn(pillBase, active ? pillActive : pillIdle)}
            >
              {group.label}
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
                <Button type="button" variant="ghost" className={cn(pillBase, active ? pillActive : pillIdle)}>
                  {group.label}
                  <ChevronDownIcon className="size-3.5 opacity-70" aria-hidden />
                </Button>
              }
            />
            <DropdownMenuContent
              align="start"
              sideOffset={10}
              className="min-w-[13.5rem] rounded-md border border-border/80 bg-popover p-1.5 shadow-[0_12px_32px_-12px_rgba(26,46,40,0.28)] ring-0"
            >
              {group.items.map((item) => {
                const itemActivePath = pathMatches(pathname, item.href)
                return (
                  <DropdownMenuItem
                    key={item.href}
                    className={cn(
                      "cursor-pointer gap-2.5 rounded-sm px-2.5 py-2.5 text-sm",
                      "focus:bg-primary-tint focus:text-primary-dark",
                      itemActivePath && "bg-primary-tint font-medium text-primary-dark",
                    )}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="size-4 text-primary" />
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
