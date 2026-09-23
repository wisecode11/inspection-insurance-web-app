"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronDownIcon,
  DownloadIcon,
  LogOutIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  SunIcon,
  UserRoundIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import * as React from "react"

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
import { useReportNotifications } from "@/modules/notifications/hooks/use-report-notifications"
import type { Role } from "@/types/role"
import { cn } from "@/lib/utils"

/** Premium dark-green enterprise top navbar (screenshot-accurate). */
export function TopBar({ role }: { role: Role }) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [themeMounted, setThemeMounted] = React.useState(false)
  const [searchFocused, setSearchFocused] = React.useState(false)
  const meta = roleMeta[role]
  const user = useSessionUser()
  const name = user ? displayName(user) : meta.label
  const email = user?.email ?? ""
  const avatar = user ? initials(user) : role === "platform" ? "PA" : "CA"
  const isDark = resolvedTheme === "dark"
  const isCompany = role === "company"
  const { unreadCount } = useReportNotifications()

  const accountHref =
    role === "platform" ? ROUTES.superAdmin.users : ROUTES.company.organization

  React.useEffect(() => setThemeMounted(true), [])

  async function handleLogout() {
    await destroySession()
    window.location.assign(role === "platform" ? ROUTES.superAdmin.login : "/login")
  }

  if (isCompany) {
    const opsBadge = unreadCount > 0 ? unreadCount : 12

    return (
      <header className="sticky top-0 z-40 shrink-0 bg-[#063728] text-white">
        <div className={cn("mx-auto w-full px-4 sm:px-6", COMPANY_SHELL_MAX_CLASS)}>
          {/* Row 1 — 72px utility bar */}
          <div className="flex h-[72px] items-center gap-3 sm:gap-4">
            <div className="flex shrink-0 items-center gap-2">
              <CompanyMobileNav variant="onPrimary" />
              <Link href={ROUTES.company.dashboard} className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#0F5C43] ring-1 ring-white/10">
                  <ShieldIcon className="size-4 text-white" />
                </span>
                <span className="hidden min-w-0 flex-col leading-tight sm:flex">
                  <span className="text-[15px] font-semibold tracking-tight text-white">
                    RoofClaim
                  </span>
                  <span className="text-[11px] font-medium text-white/50">Company Admin</span>
                </span>
              </Link>
            </div>

            <motion.div
              className="relative mx-auto hidden w-full max-w-[420px] flex-1 md:block"
              animate={{ scale: searchFocused ? 1.015 : 1 }}
              transition={{ duration: 0.18 }}
            >
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/45" />
              <Input
                type="search"
                placeholder="Press ⌘K to search or run action..."
                aria-label="Search"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={cn(
                  "h-[42px] w-full rounded-xl border border-white/[0.08] bg-white/[0.08] pl-10 pr-16 text-sm text-white shadow-none",
                  "placeholder:text-white/40 focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/15",
                )}
              />
              <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/45">
                ⌘K
              </kbd>
            </motion.div>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden h-10 rounded-full border-white/20 bg-transparent px-4 text-white hover:bg-white/10 hover:text-white lg:inline-flex"
                nativeButton={false}
                render={<Link href={ROUTES.company.analytics} />}
              >
                <DownloadIcon data-icon="inline-start" className="size-3.5" />
                Export report
              </Button>
              <Button
                size="sm"
                className="hidden h-10 rounded-full bg-[#0F8F5A] px-[18px] text-white hover:bg-[#0d7a4d] sm:inline-flex"
                nativeButton={false}
                render={<Link href={ROUTES.company.jobs} />}
              >
                <PlusIcon data-icon="inline-start" className="size-3.5" />
                New job
              </Button>
              <NotificationBell tone="onPrimary" />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label="Account menu"
                      className="h-11 gap-2.5 rounded-full bg-white/[0.06] px-2 text-white ring-1 ring-white/10 hover:bg-white/10 hover:text-white sm:pr-3"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0A4B37] text-[11px] font-bold tracking-tight ring-1 ring-white/15">
                        {avatar}
                      </span>
                      <span className="hidden min-w-0 flex-col items-start text-left leading-tight lg:flex">
                        <span className="max-w-[8.5rem] truncate text-[13px] font-semibold">
                          {name}
                        </span>
                        <span className="text-[10px] font-medium text-white/50">Admin</span>
                      </span>
                      <ChevronDownIcon className="hidden size-3.5 opacity-50 lg:block" aria-hidden />
                    </Button>
                  }
                />
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-64 rounded-xl border border-[#E6E9E7] p-0 shadow-md"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex flex-col gap-1 px-3 py-2.5 font-normal">
                      <span className="text-sm font-semibold text-[#101828]">{name}</span>
                      {email ? (
                        <span className="text-xs font-normal text-[#667085]">{email}</span>
                      ) : null}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-0" />
                    <DropdownMenuItem
                      className="rounded-lg px-3 py-2.5"
                      onClick={() => router.push(accountHref)}
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

          {/* Row 2 — primary nav */}
          <div className="border-t border-white/[0.08] py-2">
            <TopNav badgeCount={opsBadge} />
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
              <DropdownMenuItem className="rounded-lg px-2 py-2" onClick={() => router.push(accountHref)}>
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
            <DropdownMenuItem variant="destructive" className="rounded-lg px-2 py-2" onClick={handleLogout}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
