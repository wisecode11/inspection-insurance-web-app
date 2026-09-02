"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOutIcon } from "lucide-react"

import { BrandMark } from "@/components/brand-mark"
import { Button } from "@/components/ui/button"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { destroySession } from "@/lib/auth/session"
import { navGroupsForRole, roleMeta } from "@/lib/navigation"
import { getStoredUser } from "@/lib/auth/user-storage"
import { ROUTES } from "@/lib/constants/routes"
import type { Role } from "@/types/role"
import { cn } from "@/lib/utils"

/** Shared sidebar navigation — used in desktop panel and mobile sheet. */
export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const user = typeof window !== "undefined" ? getStoredUser() : null
  const navGroups = navGroupsForRole(role, user?.role)
  const meta = roleMeta[role]

  async function handleLogout() {
    await destroySession()
    window.location.assign(role === "platform" ? ROUTES.superAdmin.login : "/login")
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 px-5 pb-2 pt-5">
        <BrandMark variant="sidebar" subtitle={meta.sub} onDark />
      </div>

      <div className="app-sidebar-nav flex min-h-0 flex-1 flex-col gap-0 overflow-hidden px-3 py-1">
        {navGroups.map((group, groupIndex) => (
          <div key={group.label} className="flex shrink-0 flex-col">
            <p
              className={cn(
                "px-2.5 pb-1 text-[10px] font-semibold tracking-[0.12em] text-white/45 uppercase",
                groupIndex === 0 ? "pt-0.5" : "pt-2.5",
              )}
            >
              {group.label}
            </p>
            <SidebarMenu className="gap-0">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.href} className="relative">
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      size="default"
                      className={cn(
                        "h-10 pr-9 text-sm text-white/75 hover:bg-white/10 hover:text-white",
                        "data-active:border-transparent data-active:bg-white/10 data-active:font-semibold data-active:text-white data-active:shadow-none",
                        "[&_svg]:size-[17px] [&_svg]:text-white/80 data-active:[&_svg]:text-white",
                      )}
                      render={
                        <Link
                          href={item.href}
                          onClick={() => {
                            if (isMobile) setOpenMobile(false)
                          }}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                    {active ? (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 right-3.5 z-10 size-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.2)]"
                      />
                    ) : null}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </div>
        ))}
      </div>

      <div className="shrink-0 p-4 pt-2">
        <Button
          type="button"
          className="h-10 w-full justify-center gap-2 border border-white/25 bg-white text-sm font-semibold text-primary shadow-none hover:bg-white/95 hover:text-primary-dark"
          onClick={handleLogout}
        >
          <LogOutIcon className="size-[17px] shrink-0" aria-hidden />
          Log out
        </Button>
      </div>
    </div>
  )
}
