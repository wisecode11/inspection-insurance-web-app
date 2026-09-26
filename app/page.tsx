import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, CheckCircle2Icon, StarIcon } from "lucide-react"

import { BackToTop } from "@/components/marketing/back-to-top"
import { ConnectHubVisual } from "@/components/marketing/connect-hub-visual"
import { DashboardShowcase } from "@/components/marketing/dashboard-showcase"
import { FeaturesSection } from "@/components/marketing/features-section"
import { HeroSparkles } from "@/components/marketing/hero-sparkles"
import { HeroVisual } from "@/components/marketing/hero-visual"
import { PortalsSection } from "@/components/marketing/portals-section"
import { PricingSection } from "@/components/marketing/pricing-section"
import { Reveal } from "@/components/marketing/reveal"
import { RoofJourney } from "@/components/marketing/roof-journey"
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome"
import { TypewriterText } from "@/components/marketing/typewriter-text"
import { UserGuideSteps } from "@/components/marketing/user-guide-steps"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

const heroPhrases = [
  "for roofing claims",
  "for storm damage",
  "for faster approvals",
  "for carrier reviews",
]

const heroCursorColors = ["#2f9e6e", "#e0a526", "#3b82c4", "#d9634c"]

const heroAvatars = [
  { name: "Sam Rivera", src: "/avatars/avatar-12.jpg" },
  { name: "Casey Nguyen", src: "/avatars/avatar-33.jpg" },
  { name: "Dana Cole", src: "/avatars/avatar-47.jpg" },
  { name: "Morgan Jones", src: "/avatars/avatar-5.jpg" },
]

const connectPoints = [
  {
    title: "We don't replace what's working.",
    text: "Field crews keep shooting. Office keeps reviewing. RoofClaim ties the evidence together.",
  },
  {
    title: "Storm, GPS, and photos in one packet.",
    text: "Date-of-loss checks and location stamps land next to the images carriers need.",
  },
  {
    title: "We build only what's missing.",
    text: "Test squares, branded PDFs, and a carrier-ready file — without another disconnected tool.",
  },
]

const stories = [
  { badge: "Fewer reshoots", badgeClass: "bg-success text-success-foreground", quote: "Adjusters stopped asking us to reshoot. GPS and timestamps are on every photo.", name: "Sam Rivera", role: "Summit Ridge Roofing", avatar: "SR" },
  { badge: "Storm flagged", badgeClass: "bg-warning text-warning-foreground", quote: "Mismatch flags keep a weak file from going out. That’s the whole product.", name: "Casey Nguyen", role: "Apex Storm Restoration", avatar: "CN" },
  { badge: "40+ inspectors", badgeClass: "bg-primary text-primary-foreground", quote: "Invites, status, and reports live in one workspace for the whole crew.", name: "Dana Cole", role: "Ironclad Exteriors", avatar: "DC" },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background">
      <SiteHeader />

      <main>
        <section className="relative overflow-x-clip bg-[radial-gradient(ellipse_at_70%_45%,#f4faf7_0%,#e8f3ed_48%,#dceee6_100%)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_50%,rgba(255,255,255,0.85),transparent_55%)]"
          />
          <HeroSparkles />

          <div className="relative z-20 mx-auto grid max-w-7xl items-center gap-4 px-4 pt-16 pb-6 sm:px-6 sm:pt-[4.5rem] md:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] md:gap-2 md:pb-8 xl:gap-0">
            <div className="relative z-20 min-w-0 max-w-lg md:max-w-none md:pr-1 md:pt-2 lg:pr-2">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-primary-dark/70 uppercase sm:text-xs">
                Inspection evidence platform
              </p>
              <h1 className="mt-4 text-[2.35rem] font-bold tracking-tight text-balance text-primary-dark sm:text-5xl sm:leading-[1.05] lg:text-[3.25rem] lg:leading-[1.04]">
                Stronger files
                <br />
                <TypewriterText
                  phrases={heroPhrases}
                  colors={heroCursorColors}
                  className="font-serif text-[0.95em] font-normal text-primary"
                />
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-[#5a6b64] sm:mt-6 sm:text-lg sm:leading-8">
                Capture the roof, verify the storm, and send a branded report
                carriers can actually use.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="h-12 rounded-xl bg-primary-dark px-7 hover:bg-primary-dark/90"
                  render={<Link href="/signup" />}
                >
                  Start free trial
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-primary-dark/70 bg-white/40 px-7 text-primary-dark hover:bg-white/70"
                  render={<Link href="/login" />}
                >
                  Log in
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 sm:mt-10">
                <div className="flex -space-x-3" aria-hidden>
                  {heroAvatars.map((avatar) => (
                    <Image
                      key={avatar.src}
                      src={avatar.src}
                      alt=""
                      width={44}
                      height={44}
                      className="size-11 rounded-full border-2 border-white object-cover shadow-sm"
                    />
                  ))}
                  <span className="flex size-11 items-center justify-center rounded-full border-2 border-white bg-white text-xs font-semibold text-primary-dark shadow-sm">
                    +40
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-warning" aria-hidden>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} className="size-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-1 text-sm leading-snug text-[#5a6b64]">
                    Trusted by{" "}
                    <span className="font-semibold text-primary-dark">
                      40+ roofing companies
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex min-w-0 items-center justify-center md:justify-end">
              <HeroVisual className="w-full max-w-[24rem] sm:max-w-[28rem] md:max-w-[27rem] lg:max-w-[30rem] xl:max-w-[34rem]" />
            </div>
          </div>
        </section>

        <RoofJourney />

        <section className="relative overflow-hidden py-20 md:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_55%)]"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
            <ConnectHubVisual className="order-2 lg:order-1" />

            <div className="order-1 max-w-xl lg:order-2 lg:justify-self-end">
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                You probably don&apos;t need more software
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
                We connect what already works and build only what&apos;s missing.
              </h2>
              <ul className="mt-10 flex flex-col gap-7">
                {connectPoints.map((point) => (
                  <li key={point.title} className="flex gap-3.5">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <CheckCircle2Icon className="size-3.5" strokeWidth={2.5} />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{point.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {point.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <Button className="mt-10 rounded-full" render={<Link href={ROUTES.marketing.howItWorks} />}>
                See how it works
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </section>

        <DashboardShowcase />

        <FeaturesSection />

        <UserGuideSteps />

        <PricingSection />

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Used by crews who <span className="text-primary">file claims</span>
            </h2>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {stories.map((item, i) => (
                <Reveal key={item.name} delay={i * 0.08}>
                  <blockquote className="relative h-full rounded-2xl border bg-card p-6">
                    <span className={cn("absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold", item.badgeClass)}>
                      {item.badge}
                    </span>
                    <div className="mt-2 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className="size-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.quote}</p>
                    <div className="mt-6 flex items-center gap-3 border-t pt-5">
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {item.avatar}
                      </span>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.role}</p>
                      </div>
                    </div>
                  </blockquote>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <PortalsSection />

        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-primary/8 p-8 text-center md:p-16 dark:from-primary/15 dark:via-background dark:to-background dark:border-primary/20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to tighten the claim file?</h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Start a company trial or log in as platform admin.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" className="h-12 px-8" render={<Link href="/signup" />}>
                  Get started free
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 bg-card px-8" render={<Link href="/login" />}>
                  Log in
                </Button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">Company signup · Platform admin login · Role-based portals</p>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
      <BackToTop />
    </div>
  )
}
