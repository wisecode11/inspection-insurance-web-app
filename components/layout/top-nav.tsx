"use client"

import * as React from "react"
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

import { NavIcon3D, type NavIcon3DKind } from "@/components/layout/nav-icon-3d"
import { Icon3D, type Icon3DKey } from "@/components/shared/icon-3d"
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
import { ROUTES } from "@/lib/constants/routes"
import type { NavItem } from "@/lib/navigation/types"
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

/** Three.js models used in the desktop nav (flat icons above are the WebGL fallback). */
const GROUP_ICONS_THREE: Record<string, NavIcon3DKind> = {
  Dashboard: "dashboard",
  Operations: "briefcase",
  Team: "team",
  Configurations: "sliders",
  "Reports & Analytics": "bars",
  Settings: "gear",
}

/** Three.js models for dropdown items, keyed by route. */
const ITEM_ICONS_THREE: Record<string, NavIcon3DKind> = {
  [ROUTES.company.jobs]: "clipboard",
  [ROUTES.company.staff]: "team",
  [ROUTES.company.organization]: "building",
  [ROUTES.company.billing]: "card",
  [ROUTES.company.branding]: "palette",
  [ROUTES.company.codes]: "book",
  [ROUTES.company.reports]: "document",
  [ROUTES.company.analytics]: "bars",
  [ROUTES.company.templates]: "language",
}

/** Dropdown item icon: 3D model on the white menu, flat icon as the WebGL fallback. */
function MenuItemIcon({ item }: { item: NavItem }) {
  const flat = item.icon3d ? (
    <Icon3D name={item.icon3d} size={22} className="shrink-0 drop-shadow-[0_4px_8px_rgba(16,24,40,0.12)]" />
  ) : (
    <item.icon className="size-4 text-[#0A4B37]" />
  )
  const kind = ITEM_ICONS_THREE[item.href]
  return kind ? <NavIcon3D kind={kind} size={22} tone="light" fallback={flat} /> : flat
}

/** Links sit above the sliding pill; colour shifts to white on hover/active. */
const itemBase =
  "group/nav relative z-10 inline-flex h-9 items-center gap-2 rounded-[10px] bg-transparent px-3 text-sm font-semibold text-[rgba(230,242,236,0.82)] transition-colors duration-200 outline-none hover:bg-transparent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4ADE80] data-[active=true]:text-white"

/** Horizontal enterprise nav for the dark ops header, with a sliding hover pill. */
export function TopNav({ badgeCount = 0 }: { badgeCount?: number }) {
  const pathname = usePathname()
  const user = typeof window !== "undefined" ? getStoredUser() : null
  const groups = companyNavGroupsForUserRole(user?.role)

  const navRef = React.useRef<HTMLElement>(null)
  const indicatorRef = React.useRef<HTMLSpanElement>(null)
  const resetRef = React.useRef<() => void>(() => {})

  /* ---------- Sliding pill ---------- */
  React.useEffect(() => {
    const nav = navRef.current
    const indicator = indicatorRef.current
    if (!nav || !indicator) return

    const items = Array.from(nav.querySelectorAll<HTMLElement>("[data-nav-item]"))

    const moveTo = (el: HTMLElement | null) => {
      if (!el) {
        indicator.style.opacity = "0"
        return
      }
      indicator.style.opacity = "1"
      indicator.style.width = `${el.offsetWidth}px`
      indicator.style.transform = `translate(${el.offsetLeft}px, ${el.offsetTop}px)`
    }

    // Rest on an open dropdown trigger if there is one, otherwise the active page.
    const reset = () =>
      moveTo(
        items.find((el) => el.getAttribute("aria-expanded") === "true") ??
          items.find((el) => el.dataset.active === "true") ??
          null,
      )
    resetRef.current = reset

    // First placement without animation, then re-enable the glide.
    indicator.style.transition = "none"
    reset()
    void indicator.offsetWidth
    indicator.style.transition = ""

    const onEnter = (event: Event) => moveTo(event.currentTarget as HTMLElement)
    // Only keyboard focus moves the pill — not the focus a closing menu hands back to its trigger.
    const onFocus = (event: Event) => {
      const el = event.currentTarget as HTMLElement
      if (el.matches(":focus-visible")) moveTo(el)
    }
    const onFocusOut = (event: FocusEvent) => {
      if (!nav.contains(event.relatedTarget as Node | null)) reset()
    }

    items.forEach((el) => {
      el.addEventListener("pointerenter", onEnter)
      el.addEventListener("focus", onFocus)
    })
    nav.addEventListener("pointerleave", reset)
    nav.addEventListener("focusout", onFocusOut)
    window.addEventListener("resize", reset)
    let alive = true
    void document.fonts?.ready.then(() => alive && reset())

    return () => {
      alive = false
      items.forEach((el) => {
        el.removeEventListener("pointerenter", onEnter)
        el.removeEventListener("focus", onFocus)
      })
      nav.removeEventListener("pointerleave", reset)
      nav.removeEventListener("focusout", onFocusOut)
      window.removeEventListener("resize", reset)
    }
  }, [pathname, groups.length])

  return (
    <nav ref={navRef} aria-label="Primary" className="relative hidden items-center gap-1 lg:flex">
      <span
        ref={indicatorRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 h-9 rounded-[10px] bg-white/10 opacity-0 transition-[transform,width,opacity] duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:duration-[1ms]"
      />

      {groups.map((group) => {
        const hrefs = group.items.map((item) => item.href)
        const active = groupIsActive(pathname, hrefs)
        const Icon = GROUP_ICONS[group.label] ?? group.items[0]?.icon
        const icon3d = GROUP_ICONS_3D[group.label] ?? group.items[0]?.icon3d
        const showBadge = group.label === "Operations" && badgeCount > 0
        const standalone = isStandaloneNavGroup(group)

        const flatIcon = icon3d ? (
          <Icon3D name={icon3d} size={18} className="shrink-0 drop-shadow-none opacity-95" />
        ) : Icon ? (
          <Icon className="size-3.5 shrink-0 opacity-90" aria-hidden />
        ) : null
        const kind3d = GROUP_ICONS_THREE[group.label]

        const label = (
          <>
            {kind3d ? <NavIcon3D kind={kind3d} size={20} fallback={flatIcon} /> : flatIcon}
            <span>{group.label}</span>
            {showBadge ? (
              <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#12B76A] px-1 text-[10px] font-bold text-white">
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            ) : !standalone ? (
              <ChevronDownIcon
                className="size-3 opacity-60 transition-transform duration-300 group-aria-expanded/nav:rotate-180"
                aria-hidden
              />
            ) : null}
          </>
        )

        if (standalone) {
          const item = group.items[0]
          return (
            <Link
              key={group.label}
              href={item.href}
              data-nav-item
              data-active={active}
              aria-current={active ? "page" : undefined}
              className={itemBase}
            >
              {label}
            </Link>
          )
        }

        return (
          <DropdownMenu
            key={group.label}
            onOpenChange={(open) => {
              // Glide back once the menu closes.
              if (!open) requestAnimationFrame(() => resetRef.current())
            }}
          >
            <DropdownMenuTrigger
              data-nav-item
              data-active={active}
              className={itemBase}
            >
              {label}
            </DropdownMenuTrigger>
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
                    data-icon-host
                    className={cn(
                      "cursor-pointer gap-2.5 rounded-lg px-2.5 py-2.5 text-sm",
                      itemActive && "bg-[#E8F5EF] font-medium text-[#063728]",
                    )}
                    render={<Link href={item.href} />}
                  >
                    <MenuItemIcon item={item} />
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
