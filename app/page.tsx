import Image from "next/image"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRightIcon,
  CameraIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  CloudSunIcon,
  FileTextIcon,
  MapPinIcon,
  PaletteIcon,
  ShieldIcon,
  SquareCheckIcon,
  StarIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react"

import { BackToTop } from "@/components/marketing/back-to-top"
import { ConnectHubVisual } from "@/components/marketing/connect-hub-visual"
import { FeaturePhone } from "@/components/marketing/feature-phone"
import { HeroSparkles } from "@/components/marketing/hero-sparkles"
import { HeroVisual } from "@/components/marketing/hero-visual"
import { LaptopMockup } from "@/components/marketing/laptop-mockup"
import { Reveal } from "@/components/marketing/reveal"
import { RoofJourney } from "@/components/marketing/roof-journey"
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome"
import { TypewriterText } from "@/components/marketing/typewriter-text"
import { UserGuideSteps } from "@/components/marketing/user-guide-steps"
import { PortalsSection } from "@/components/marketing/portals-section"
import { Icon3D, type Icon3DKey } from "@/components/marketing/icon-3d"
import { PricingExpandCards } from "@/components/marketing/pricing-expand-cards"
import { Button } from "@/components/ui/button"
import { plansMock as plans } from "@/modules/platform-billing/mocks/billing.mock"
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

const features = [
  {
    title: "Jobs & reports",
    description: "Search inspections, open evidence, approve, and export.",
    icon: ClipboardListIcon,
    icon3d: "clipboard" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-primary to-primary/75",
    tag: "Office",
    gridClass: "lg:col-span-3 lg:row-span-2 lg:col-start-1 lg:row-start-1",
    featured: true,
  },
  {
    title: "Storm check",
    description: "NOAA cross-check on the date of loss.",
    icon: CloudSunIcon,
    icon3d: "weather" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
    tag: "Weather",
    gridClass: "lg:col-start-4 lg:row-start-1",
    compact: true,
  },
  {
    title: "Test squares",
    description: "Hail hits vs. the repair threshold.",
    icon: SquareCheckIcon,
    icon3d: "clipboard" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-success to-success/80",
    tag: "Hail",
    gridClass: "lg:col-start-5 lg:row-start-1",
    compact: true,
  },
  {
    title: "Photo evidence",
    description: "GPS-stamped photos with slope context.",
    icon: CameraIcon,
    icon3d: "camera" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-primary to-primary/70",
    tag: "Field",
    gridClass: "lg:col-span-2 lg:col-start-4 lg:row-start-2",
    compact: true,
  },
  {
    title: "Damage tags",
    description: "Hail, wind, and flashing by slope.",
    icon: MapPinIcon,
    icon3d: "zap" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-warning to-warning/80 text-warning-foreground",
    tag: "Findings",
    gridClass: "lg:col-start-1 lg:row-start-3",
    compact: true,
  },
  {
    title: "Staff",
    description: "Invite inspectors. Disable access.",
    icon: UsersIcon,
    icon3d: "users" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-primary to-primary/90",
    tag: "Team",
    gridClass: "lg:col-start-2 lg:row-start-3",
    compact: true,
  },
  {
    title: "Branding",
    description: "Logo and colors on the report header.",
    icon: PaletteIcon,
    icon3d: "palette" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground",
    tag: "Brand",
    gridClass: "lg:col-start-3 lg:row-start-3",
    compact: true,
  },
  {
    title: "PDF export",
    description: "Carrier-ready packet in one click.",
    icon: FileTextIcon,
    icon3d: "file" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-success to-success/85",
    tag: "Share",
    gridClass: "lg:col-start-4 lg:row-start-3",
    compact: true,
  },
  {
    title: "Platform",
    description: "Tenants, billing, and support tools.",
    icon: ShieldIcon,
    icon3d: "platform" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-primary/90 to-primary",
    tag: "SaaS",
    gridClass: "lg:col-start-5 lg:row-start-3",
    compact: true,
  },
] as const

const phoneFeatures = features.slice(0, 5)
const extraFeatures = features.slice(5)

const featurePhrases = ["file the claim", "verify the storm", "send the report"]

const stories = [
  { badge: "Fewer reshoots", badgeClass: "bg-success text-success-foreground", quote: "Adjusters stopped asking us to reshoot. GPS and timestamps are on every photo.", name: "Sam Rivera", role: "Summit Ridge Roofing", avatar: "SR" },
  { badge: "Storm flagged", badgeClass: "bg-warning text-warning-foreground", quote: "Mismatch flags keep a weak file from going out. That’s the whole product.", name: "Casey Nguyen", role: "Apex Storm Restoration", avatar: "CN" },
  { badge: "40+ inspectors", badgeClass: "bg-primary text-primary-foreground", quote: "Invites, status, and reports live in one workspace for the whole crew.", name: "Dana Cole", role: "Ironclad Exteriors", avatar: "DC" },
]

function FeatureIcon({
  icon: Icon,
  icon3d,
  className,
  large,
  compact,
}: {
  icon: LucideIcon
  icon3d?: Icon3DKey
  className?: string
  large?: boolean
  compact?: boolean
}) {
  if (icon3d) {
    const px = large ? 56 : compact ? 36 : 48
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center bg-transparent",
          large ? "size-14" : compact ? "size-9" : "size-12",
        )}
      >
        <Icon3D name={icon3d} size={px} className="drop-shadow-[0_8px_14px_rgba(16,24,40,0.14)]" />
      </span>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl text-white shadow-[0_10px_22px_-12px_rgba(6,55,40,0.55)]",
        large ? "size-14 rounded-2xl" : compact ? "size-9" : "size-12",
        className,
      )}
    >
      <Icon className={large ? "size-7" : compact ? "size-4" : "size-6"} />
    </div>
  )
}

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
              <Button className="mt-10 rounded-full" render={<Link href="/#how-it-works" />}>
                See how it works
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-primary/10 to-transparent" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <Reveal className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                One dashboard for the entire{" "}
                <span className="rounded-xl bg-primary px-3 py-0.5 text-white [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
                  claims operation
                </span>
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">
                Company admins run jobs, staff, and branding. Platform admins run tenants and billing.
              </p>
              <Button className="mt-8" render={<Link href="/login?role=company" />}>
                Open company portal
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </Reveal>
            <Reveal delay={0.1}>
              <LaptopMockup />
            </Reveal>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 bg-muted/30 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 min-[820px]:grid-cols-[1fr_auto] min-[820px]:gap-16">
            <div className="min-w-0 justify-self-center min-[820px]:justify-self-start">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <ZapIcon className="size-3.5" />
                Company + platform toolkit
              </div>
              <h2 className="text-[clamp(2.2rem,4.6vw,2.9rem)] leading-[1.15] font-bold tracking-[-0.03em]">
                Everything you need to
                <span className="block min-h-[1.15em] whitespace-nowrap text-primary">
                  <TypewriterText
                    phrases={featurePhrases}
                    colors={heroCursorColors}
                  />
                </span>
              </h2>
              <p className="mt-5 mb-9 max-w-[30rem] text-base leading-relaxed text-muted-foreground">
                Photo evidence, storm checks, and carrier-ready reports for your
                office and every inspector in the field.
              </p>

              <p className="text-[0.85rem] text-muted-foreground/80">Also included</p>
              <ul className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {extraFeatures.map((feature) => (
                  <li key={feature.title} className="flex items-start gap-3">
                    <FeatureIcon
                      icon={feature.icon}
                      icon3d={feature.icon3d}
                      className={feature.iconBg}
                      compact
                    />
                    <div>
                      <p className="text-[0.85rem] leading-tight font-bold">{feature.title}</p>
                      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <FeaturePhone
              className="justify-self-center min-[820px]:justify-self-end"
              items={phoneFeatures.map((feature) => ({
                title: feature.title,
                description: feature.description,
                tag: feature.tag,
                iconClassName: "bg-transparent shadow-none",
                icon: <Icon3D name={feature.icon3d} size={26} className="drop-shadow-none" />,
              }))}
            />
          </div>
        </section>

        <UserGuideSteps />

        <section id="pricing" className="scroll-mt-20 bg-muted/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
              <p className="mt-4 text-muted-foreground">Seat-based plans for roofing companies</p>
            </div>
            <PricingExpandCards plans={plans} />
          </div>
        </section>

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
