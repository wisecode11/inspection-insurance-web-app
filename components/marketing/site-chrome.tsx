"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowRightIcon,
  BoxIcon,
  CircleHelpIcon,
  CreditCardIcon,
  MenuIcon,
  SmartphoneIcon,
  WorkflowIcon,
  type LucideIcon,
} from "lucide-react"
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion"
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
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

const links: { href: string; label: string; icon: LucideIcon; hint: string }[] = [
  { href: ROUTES.marketing.features, label: "Product", icon: BoxIcon, hint: "Evidence, storm checks, reports" },
  { href: ROUTES.marketing.mobileApp, label: "Mobile app", icon: SmartphoneIcon, hint: "The Inspector app for the field" },
  { href: ROUTES.marketing.howItWorks, label: "How it works", icon: WorkflowIcon, hint: "From signup to carrier-ready file" },
  { href: ROUTES.marketing.pricing, label: "Pricing", icon: CreditCardIcon, hint: "Seat-based plans" },
  { href: ROUTES.marketing.faq, label: "FAQ", icon: CircleHelpIcon, hint: "Answers to common questions" },
]

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Marketing header. At the top of the page it is a full-width transparent bar;
 * once the page scrolls it condenses into a floating glass pill with a reading
 * progress hairline. The outer height never changes (4.25rem), so sticky
 * sections that offset by the header stay aligned.
 */
export function SiteHeader() {
  const [open, setOpen] = React.useState(false)
  const [role, setRole] = React.useState<ReturnType<typeof getSessionRole>>(null)
  const [scrolled, setScrolled] = React.useState(false)
  const [hovered, setHovered] = React.useState<string | null>(null)
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })

  React.useEffect(() => {
    setRole(getSessionRole())
  }, [])

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
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
      <motion.header
        className="fixed inset-x-0 top-0 z-50 flex h-16 items-center px-3 sm:h-[4.25rem] sm:px-4"
        initial={reduceMotion ? false : { y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div
          className={cn(
            "relative mx-auto flex w-full items-center justify-between gap-4 border transition-[max-width,height,padding,border-radius,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            scrolled
              ? "h-[3.75rem] max-w-[77rem] rounded-full border-border/60 bg-background/75 pr-2.5 pl-5 shadow-[0_18px_50px_-24px_rgba(6,55,40,0.45),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl sm:pl-6 dark:shadow-[0_18px_50px_-24px_rgba(0,0,0,0.7)]"
              : "h-full max-w-[80rem] rounded-none border-transparent bg-transparent px-1 sm:px-2",
          )}
        >
          <BrandMark className="shrink-0 [&_span:first-child]:size-9 [&_span:first-child]:rounded-full [&_span:first-child_svg]:size-4 [&_.text-sm]:text-base [&_.text-sm]:font-bold" />

          <nav
            className="hidden items-center lg:flex"
            aria-label="Primary"
            onMouseLeave={() => setHovered(null)}
          >
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHovered(link.href)}
                  onFocus={() => setHovered(link.href)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm transition-colors duration-200",
                    isActive ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {hovered === link.href && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 -z-10 rounded-full bg-primary/[0.07] ring-1 ring-primary/10"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-[#12b76a] shadow-[0_0_8px_rgba(18,183,106,0.8)]"
                    />
                  )}
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
                <Button size="sm" className="beam-edge hidden rounded-full px-5 sm:inline-flex" onClick={signOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary/[0.06] hover:text-foreground sm:inline"
                >
                  Log in
                </Link>
                <Button
                  size="sm"
                  className="beam-edge group hidden h-9 rounded-full pr-4 pl-5 sm:inline-flex"
                  render={<Link href="/signup" />}
                >
                  Start free trial
                  <ArrowRightIcon
                    data-icon="inline-end"
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </Button>
              </>
            )}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={<Button variant="ghost" size="icon-sm" className="rounded-full ring-1 ring-border/60 lg:hidden" />}
              >
                <MenuIcon />
                <span className="sr-only">Open menu</span>
              </SheetTrigger>
              <SheetContent side="right" className="w-[19rem] gap-0 p-0">
                <SheetHeader className="border-b px-5 py-4">
                  <SheetTitle className="text-base">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-1 flex-col gap-1 p-3">
                  {links.map((link, i) => {
                    const isActive = pathname === link.href
                    return (
                      <motion.div
                        key={link.href}
                        initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, ease: EASE, delay: 0.05 + i * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors",
                            isActive ? "bg-primary/[0.08]" : "hover:bg-muted",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-primary/10 text-primary group-hover:bg-primary/15",
                            )}
                          >
                            <link.icon className="size-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-foreground">{link.label}</span>
                            <span className="block truncate text-xs text-muted-foreground">{link.hint}</span>
                          </span>
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>
                <div className="flex flex-col gap-2 border-t p-4">
                  {role ? (
                    <>
                      <Button className="h-11 rounded-full" render={<Link href={roleDestinations[role]} />}>
                        Dashboard
                      </Button>
                      <Button variant="outline" className="h-11 rounded-full" onClick={signOut}>
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="group h-11 rounded-full bg-primary-dark" render={<Link href="/signup" />}>
                        Start free trial
                        <ArrowRightIcon data-icon="inline-end" className="transition-transform group-hover:translate-x-0.5" />
                      </Button>
                      <Button variant="outline" className="h-11 rounded-full" render={<Link href="/login" />}>
                        Log in
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Reading progress hairline along the bottom of the pill */}
          <motion.span
            aria-hidden
            className={cn(
              "pointer-events-none absolute right-6 -bottom-px left-6 h-[2px] origin-left rounded-full bg-gradient-to-r from-primary via-[#12b76a] to-[#6ae8b0] transition-opacity duration-500",
              scrolled ? "opacity-100" : "opacity-0",
            )}
            style={{ scaleX: progress }}
          />
        </div>
      </motion.header>
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
            <li><Link href={ROUTES.marketing.features} className="hover:text-white">Features</Link></li>
            <li><Link href={ROUTES.marketing.mobileApp} className="hover:text-white">Mobile app</Link></li>
            <li><Link href={ROUTES.marketing.howItWorks} className="hover:text-white">How it works</Link></li>
            <li><Link href={ROUTES.marketing.pricing} className="hover:text-white">Pricing</Link></li>
            <li><Link href={ROUTES.marketing.faq} className="hover:text-white">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wider text-white/50 uppercase">Portals</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-white/70">
            <li><Link href={ROUTES.marketing.portals} className="hover:text-white">Overview</Link></li>
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
