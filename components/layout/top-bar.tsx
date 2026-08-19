"use client"

import { BellIcon, Building2Icon, ShieldIcon } from "lucide-react"

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
import { roleMeta } from "@/lib/navigation"
import { useSessionUser } from "@/modules/auth/hooks/use-session-user"
import type { Role } from "@/types/role"
import { cn } from "@/lib/utils"

const roleIcon = { platform: ShieldIcon, company: Building2Icon }

export function TopBar({ role }: { role: Role }) {
  const meta = roleMeta[role]
  const user = useSessionUser()
  const Icon = roleIcon[role]
  const name = user ? displayName(user) : meta.label
  const email = user?.email ?? ""
  const avatar = user ? initials(user) : role === "platform" ? "PA" : "CA"

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
        <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
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
            render={<Button variant="ghost" className="h-9 gap-2 px-1.5" />}
          >
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {avatar}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{name}</span>
              {email ? (
                <span className="text-xs font-normal text-muted-foreground">{email}</span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Account settings</DropdownMenuItem>
              <DropdownMenuItem>Notifications</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                await destroySession()
                window.location.assign("/login")
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
