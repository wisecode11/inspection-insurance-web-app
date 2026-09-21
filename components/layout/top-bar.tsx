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

import { BrandMark } from "@/components/brand-mark"
import { CompanyMobileNav } from "@/components/layout/company-mobile-nav"
import { NotificationBell } from "@/components/layout/notification-bell"
import { TopNav } from "@/components/layout/top-nav"
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
import { COMPANY_SHELL_MAX_CLASS } from "@/lib/constants/layout"
import { ROUTES } from "@/lib/constants/routes"
import { roleMeta } from "@/lib/navigation"
import { useSessionUser } from "@/modules/auth/hooks/use-session-user"
import type { Role } from "@/types/role"
import { cn } from "@/lib/utils"

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
  const isCompany = role === "company"

  const accountHref =
    role === "platform" ? ROUTES.superAdmin.users : ROUTES.company.organization

  React.useEffect(() => setThemeMounted(true), [])

  async function handleLogout() {
    await destroySession()
    window.location.assign(role === "platform" ? ROUTES.superAdmin.login : "/login")
  }

  if (isCompany) {
    return (
      <header className="sticky top-0 z-30 shrink-0 px-3 pt-4 pb-3 sm:px-4 sm:pt-5 lg:px-6">
        <div
          className={cn(
            "mx-auto grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg bg-primary px-3 py-2.5 shadow-[0_14px_40px_-12px_rgba(15,40,30,0.55)] ring-1 ring-white/10 sm:px-4 sm:py-3",
            COMPANY_SHELL_MAX_CLASS,
          )}
        >
          <div className="flex min-w-0 items-center gap-2 justify-self-start sm:gap-3">
            <CompanyMobileNav variant="onPrimary" />
            <BrandMark
              href={ROUTES.company.dashboard}
              onDark
              className="shrink-0 [&_span:first-child]:size-9 [&_span:first-child]:rounded-lg [&_span:first-child]:bg-white/15 [&_svg]:size-4 [&_.tracking-tight]:text-[0.95rem] [&_.tracking-tight]:font-bold [&_.tracking-tight]:text-white"
            />
          </div>

          <div className="justify-self-center">
            <TopNav />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-1.5 justify-self-end sm:gap-2">
            <NotificationBell tone="onPrimary" />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Account menu"
                    className="size-10 shrink-0 rounded-md bg-white/15 p-0 text-white ring-1 ring-white/25 hover:bg-white/25 hover:text-white"
                  >
                    <span className="text-[11px] font-bold tracking-tight">{avatar}</span>
                  </Button>
                }
              />
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-64 rounded-md border border-border p-0 shadow-md ring-0"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex flex-col gap-1 px-3 py-2.5 font-normal">
                    <span className="text-sm font-semibold text-foreground">{name}</span>
                    {email ? (
                      <span className="text-xs font-normal text-muted-foreground">{email}</span>
                    ) : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-0" />
                  <DropdownMenuItem
                    className="rounded-lg px-3 py-2.5"
                    onClick={() => {
                      router.push(accountHref)
                    }}
                  >
                    <UserRoundIcon />
                    Organization
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-lg px-3 py-2.5"
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                  >
                    {themeMounted && isDark ? <SunIcon /> : <MoonIcon />}
                    {themeMounted && isDark ? "Light mode" : "Dark mode"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-0" />
                <DropdownMenuItem
                  variant="destructive"
                  className="rounded-lg px-3 py-2.5"
                  onClick={handleLogout}
                >
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 bg-[var(--color-bg-canvas)] px-4 py-4 sm:gap-6 sm:px-6 sm:pt-5 sm:pb-4">
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

      <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-2 py-1.5 sm:gap-2.5 sm:px-3 sm:py-2">
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
                User Management
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
