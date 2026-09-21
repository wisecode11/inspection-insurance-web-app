"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon } from "lucide-react"

import { BrandMark } from "@/components/brand-mark"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  companyNavGroupsForUserRole,
  isStandaloneNavGroup,
} from "@/lib/navigation/company"
import { getStoredUser } from "@/lib/auth/user-storage"
import { roleMeta } from "@/lib/navigation"
import { cn } from "@/lib/utils"

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

/** Hamburger + sheet nav for company admin on small screens. */
export function CompanyMobileNav({
  variant = "default",
}: {
  variant?: "default" | "onPrimary"
}) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const user = typeof window !== "undefined" ? getStoredUser() : null
  const groups = companyNavGroupsForUserRole(user?.role)
  const meta = roleMeta.company
  const onPrimary = variant === "onPrimary"

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Open navigation"
        className={cn(
          "size-10 shrink-0 rounded-full lg:hidden",
          onPrimary
            ? "text-white hover:bg-white/15 hover:text-white"
            : "bg-card text-muted-foreground shadow-sm hover:bg-primary-tint hover:text-primary-dark",
        )}
        onClick={() => setOpen(true)}
      >
        <MenuIcon className="size-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-[min(20rem,88vw)] border-none bg-[var(--color-bg-canvas)] p-0"
        >
          <SheetHeader className="border-b border-border/60 px-5 py-4 text-left">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <BrandMark href="/company/dashboard" subtitle={meta.sub} />
          </SheetHeader>

          <nav aria-label="Primary" className="flex flex-col gap-4 overflow-y-auto px-3 py-4">
            {groups.map((group) => {
              if (isStandaloneNavGroup(group)) {
                const item = group.items[0]
                const active = pathMatches(pathname, item.href)
                return (
                  <Link
                    key={group.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-card",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {group.label}
                  </Link>
                )
              }

              return (
                <div key={group.label} className="flex flex-col gap-0.5">
                  <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    const active = pathMatches(pathname, item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-card",
                        )}
                      >
                        <item.icon className="size-4 shrink-0" />
                        {item.title}
                      </Link>
                    )
                  })}
                </div>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
