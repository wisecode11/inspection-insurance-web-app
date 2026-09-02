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

const links = [
  { href: "/#features", label: "Product" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#portals", label: "Portals" },
]

export function SiteHeader() {
  const [open, setOpen] = React.useState(false)
  const [role, setRole] = React.useState<ReturnType<typeof getSessionRole>>(null)

  React.useEffect(() => {
    setRole(getSessionRole())
  }, [])

  async function signOut() {
    await destroySession()
    window.location.assign("/")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75">
      <div className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center gap-8 px-4 sm:px-6">
        <BrandMark />
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {role ? (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" render={<Link href={roleDestinations[role]} />}>
                Dashboard
              </Button>
              <Button size="sm" className="hidden sm:inline-flex" onClick={signOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" render={<Link href="/login" />}>
                Log in
              </Button>
              <Button size="sm" className="hidden px-4 sm:inline-flex" render={<Link href="/signup" />}>
                Start free trial
              </Button>
            </>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon-sm" className="md:hidden" />}>
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
                    className="rounded-lg px-2 py-2 text-sm hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
                {role ? (
                  <>
                    <Button className="mt-4" render={<Link href={roleDestinations[role]} />}>
                      Dashboard
                    </Button>
                    <Button variant="outline" onClick={signOut}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="mt-4" render={<Link href="/login" />}>
                      Log in
                    </Button>
                    <Button variant="outline" render={<Link href="/signup" />}>
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
