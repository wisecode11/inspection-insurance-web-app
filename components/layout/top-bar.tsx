"use client"

import { useRouter } from "next/navigation"
import {
  LogOutIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  UserRoundIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { destroySession } from "@/lib/auth/session"
import { displayName, initials } from "@/lib/auth/portal"
import { ROUTES } from "@/lib/constants/routes"
import { roleMeta } from "@/lib/navigation"
import { NotificationBell } from "@/components/layout/notification-bell"
import { useSessionUser } from "@/modules/auth/hooks/use-session-user"
import type { Role } from "@/types/role"

export function TopBar({ role }: { role: Role }) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [themeMounted, setThemeMounted] = React.useState(false)
  const meta = roleMeta[role]
  const user = useSessionUser()
  const name = user ? displayName(user) : meta.label
  const email = user?.email ?? ""
  const avatar = user ? initials(user) : role === "platform" ? "PA" : "CA"
  const isDark = resolvedTheme === "dark"

  const accountHref =
    role === "platform" ? ROUTES.superAdmin.users : ROUTES.company.organization

  React.useEffect(() => setThemeMounted(true), [])

  async function handleLogout() {
    await destroySession()
    window.location.assign(role === "platform" ? ROUTES.superAdmin.login : "/login")
  }

  return (
    <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 bg-[var(--color-bg-canvas)] px-4 py-4 sm:gap-6 sm:px-6 sm:pt-5 sm:pb-4">
      {/* Left — pill search (~reference width, icon right) */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <SidebarTrigger className="size-10 shrink-0 text-muted-foreground hover:bg-card hover:text-foreground md:hidden" />

        <div className="relative w-full min-w-0 max-w-[calc(100vw-10rem)] sm:max-w-xs md:w-72 md:max-w-none md:flex-none">
          <Input
            type="search"
            placeholder="Search..."
            aria-label="Search"
            className="h-11 w-full rounded-full border-0 bg-card pr-11 pl-5 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-primary/25"
          />
          <SearchIcon className="pointer-events-none absolute top-1/2 right-4 size-[18px] -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* Right — green pill: notifications + avatar */}
      <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-2 py-1.5 sm:gap-2.5 sm:px-3 sm:py-2">
        {role === "company" ? <NotificationBell /> : null}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Account menu"
                className="size-9 shrink-0 !rounded-full bg-white p-0 text-primary hover:bg-white/90"
              >
                <span className="text-xs font-bold tracking-tight">{avatar}</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col gap-1 px-2 py-2 font-normal">
                <span className="text-sm font-semibold text-foreground">{name}</span>
                {email ? (
                  <span className="text-xs font-normal text-muted-foreground">{email}</span>
                ) : null}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1.5" />
              <DropdownMenuItem
                className="rounded-lg px-2 py-2"
                onClick={() => {
                  router.push(accountHref)
                }}
              >
                <UserRoundIcon />
                {role === "platform" ? "User Management" : "Organization"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg px-2 py-2"
                onClick={() => setTheme(isDark ? "light" : "dark")}
              >
                {themeMounted && isDark ? <SunIcon /> : <MoonIcon />}
                {themeMounted && isDark ? "Light mode" : "Dark mode"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1.5" />
            <DropdownMenuItem
              variant="destructive"
              className="rounded-lg px-2 py-2"
              onClick={handleLogout}
            >
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
