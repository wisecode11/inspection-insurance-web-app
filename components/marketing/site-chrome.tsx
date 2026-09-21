"use client"

import Link from "next/link"
import { MenuIcon } from "lucide-react"
import * as React from "react"

import { BrandMark } from "@/components/brand-mark"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { roleDestinations } from "@/lib/auth/destinations"
import { destroySession, getSessionRole } from "@/lib/auth/session"
import { cn } from "@/lib/utils"

const links = [
  { href: "/#features", hash: "features", label: "Product" },
  { href: "/#how-it-works", hash: "how-it-works", label: "How it works" },
  { href: "/#pricing", hash: "pricing", label: "Pricing" },
  { href: "/#portals", hash: "portals", label: "Portals" },
] as const

export function SiteHeader() {
  const [open, setOpen] = React.useState(false)
  const [role, setRole] = React.useState<ReturnType<typeof getSessionRole>>(null)
  const [activeHash, setActiveHash] = React.useState<string>("features")
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    setRole(getSessionRole())
  }, [])

  React.useEffect(() => {
    const sectionIds = links.map((l) => l.hash)

    function onScroll() {
      setScrolled(window.scrollY > 8)

      let current = sectionIds[0]
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top <= 140) current = id
      }
      setActiveHash(current)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  async function signOut() {
    await destroySession()
    window.location.assign("/")
  }

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
          scrolled
            ? "border-b border-border/60 bg-background/85 shadow-[0_8px_30px_-18px_rgba(26,46,40,0.28)] backdrop-blur-xl supports-backdrop-filter:bg-background/75"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6">
          <BrandMark className="shrink-0 [&_span:first-child]:size-9 [&_span:first-child]:rounded-full [&_span:first-child_svg]:size-4 [&_.text-sm]:text-base [&_.text-sm]:font-bold" />

          <nav
            className="hidden items-center rounded-full bg-muted/80 p-1 ring-1 ring-border/60 md:flex"
            aria-label="Primary"
          >
            {links.map((link) => {
              const isActive = activeHash === link.hash
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm transition-all duration-200",
                    isActive
                      ? "bg-surface font-medium text-foreground shadow-sm ring-1 ring-border/50"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            {role ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden rounded-full text-muted-foreground hover:text-foreground sm:inline-flex"
                  render={<Link href={roleDestinations[role]} />}
                >
                  Dashboard
                </Button>
                <Button
                  size="sm"
                  className="hidden rounded-full px-5 sm:inline-flex"
                  onClick={signOut}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden px-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
                >
                  Log in
                </Link>
                <Button
                  size="sm"
                  className="hidden rounded-full px-5 sm:inline-flex"
                  render={<Link href="/signup" />}
                >
                  Start free trial
                </Button>
              </>
            )}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon-sm" className="rounded-full md:hidden" />
                }
              >
                <MenuIcon />
                <span className="sr-only">Open menu</span>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>RoofClaim</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "rounded-full px-3 py-2 text-sm transition-colors",
                        activeHash === link.hash
                          ? "bg-primary-tint font-medium text-primary-dark"
                          : "hover:bg-muted",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {role ? (
                    <>
                      <Button
                        className="mt-4 rounded-full"
                        render={<Link href={roleDestinations[role]} />}
                      >
                        Dashboard
                      </Button>
                      <Button variant="outline" className="rounded-full" onClick={signOut}>
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="mt-4 rounded-full" render={<Link href="/login" />}>
                        Log in
                      </Button>
                      <Button
                        className="rounded-full"
                        render={<Link href="/signup" />}
                      >
                        Start free trial
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <div className="h-16 shrink-0 sm:h-[4.25rem]" aria-hidden />
    </>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <BrandMark onDark subtitle="Inspection & claims evidence" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Carrier-ready roof evidence for restoration and roofing companies.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wider text-white/50 uppercase">Product</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <li><Link href="/#features" className="hover:text-white">Features</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-white">How it works</Link></li>
            <li><Link href="/#pricing" className="hover:text-white">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wider text-white/50 uppercase">Portals</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <li><Link href="/login?role=company" className="hover:text-white">Company admin</Link></li>
            <li><Link href="/login?role=platform" className="hover:text-white">Platform admin</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wider text-white/50 uppercase">Account</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <li><Link href="/login" className="hover:text-white">Log in</Link></li>
            <li><Link href="/signup" className="hover:text-white">Start free trial</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/40 sm:px-6">
          © {new Date().getFullYear()} RoofClaim
        </p>
      </div>
    </footer>
  )
}
