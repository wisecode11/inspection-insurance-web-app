"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOutIcon, ShieldIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { destroySession } from "@/lib/auth/session"
import { navForRole, roleMeta } from "@/lib/navigation"
import { getStoredUser } from "@/lib/auth/user-storage"
import { ROUTES } from "@/lib/constants/routes"
import type { Role } from "@/types/role"

export function AppSidebar({ role }: { role: Role }) {
  const pathname = usePathname()
  const user = typeof window !== "undefined" ? getStoredUser() : null
  const nav = navForRole(role, user?.role)
  const meta = roleMeta[role]

  async function handleLogout() {
    await destroySession()
    window.location.assign(role === "platform" ? ROUTES.superAdmin.login : "/login")
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="gap-0 p-3">
        <div className="flex items-center gap-2.5 px-1 py-1.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <ShieldIcon className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              RoofClaim
            </span>
            <span className="truncate text-xs text-sidebar-foreground/70">{meta.sub}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>{meta.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {nav.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      render={
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-2 p-3">
        <div className="rounded-lg bg-sidebar-accent/50 p-3 text-xs text-sidebar-foreground/80">
          <p className="font-medium text-sidebar-foreground">{meta.org}</p>
          <p className="mt-0.5 text-sidebar-foreground/60">
            {role === "platform" ? "42 active tenants" : "Pro plan · 12 seats"}
          </p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log out"
              className="text-sidebar-foreground/80 hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOutIcon />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
