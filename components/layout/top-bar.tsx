"use client"

import { useRouter } from "next/navigation"
import { BellIcon, Building2Icon, LogOutIcon, ShieldIcon, UserRoundIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
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
import { useSessionUser } from "@/modules/auth/hooks/use-session-user"
import type { Role } from "@/types/role"
import { cn } from "@/lib/utils"

const roleIcon = { platform: ShieldIcon, company: Building2Icon }

export function TopBar({ role }: { role: Role }) {
  const router = useRouter()
  const meta = roleMeta[role]
  const user = useSessionUser()
  const Icon = roleIcon[role]
  const name = user ? displayName(user) : meta.label
  const email = user?.email ?? ""
  const avatar = user ? initials(user) : role === "platform" ? "PA" : "CA"

  const accountHref =
    role === "platform" ? ROUTES.superAdmin.users : ROUTES.company.organization

  async function handleLogout() {
    await destroySession()
    window.location.assign(role === "platform" ? ROUTES.superAdmin.login : "/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 h-5" />

      <div className="flex items-center gap-2 rounded-md border px-2.5 py-1.5">
        <span className="flex size-5 items-center justify-center rounded bg-primary text-primary-foreground">
          <Icon className="size-3" />
        </span>
        <span className="hidden text-sm font-medium sm:inline">{meta.label}</span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notifications"
          className="relative"
          type="button"
        >
          <BellIcon />
          <span
            className={cn(
              "absolute top-1 right-1 size-2 rounded-full bg-terracotta ring-2 ring-background",
            )}
          />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                type="button"
                className="h-9 gap-2 px-1.5"
                aria-label="Account menu"
              >
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    {avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">{name}</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{name}</span>
                {email ? (
                  <span className="text-xs font-normal text-muted-foreground">{email}</span>
                ) : null}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  router.push(accountHref)
                }}
              >
                <UserRoundIcon />
                {role === "platform" ? "User Management" : "Organization"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
