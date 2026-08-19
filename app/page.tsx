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
  HeadphonesIcon,
  MapPinIcon,
  PaletteIcon,
  ShieldIcon,
  SquareCheckIcon,
  StarIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react"

import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome"
import { Button } from "@/components/ui/button"
import { plansMock as plans } from "@/modules/platform-billing/mocks/billing.mock"
import { cn } from "@/lib/utils"

const whyPoints = [
  "GPS and timestamp on every inspection photo",
  "Storm data checked against the date of loss",
  "Test-square counts ready for the carrier",
  "Branded PDFs with your license and logo",
]

const pillars = [
  { title: "Photo evidence", text: "Slope, GPS, and time on every shot.", src: "/images/roof-inspect.png" },
  { title: "Storm check", text: "Verified or mismatch, on the report.", src: "/images/section-storm.png" },
  { title: "Claim reports", text: "A packet the insurer can actually use.", src: "/images/aerial-roofs.jpg" },
]

const features = [
  {
    title: "Jobs & reports",
    description: "Search inspections, open evidence, approve, and export.",
    icon: ClipboardListIcon,
    iconBg: "bg-gradient-to-br from-primary to-primary/75",
    tag: "Office",
    gridClass: "lg:col-span-3 lg:row-span-2 lg:col-start-1 lg:row-start-1",
    featured: true,
  },
  {
    title: "Storm check",
    description: "NOAA cross-check on the date of loss.",
    icon: CloudSunIcon,
    iconBg: "bg-gradient-to-br from-terracotta to-terracotta/80 text-terracotta-foreground",
    tag: "Weather",
    gridClass: "lg:col-start-4 lg:row-start-1",
    compact: true,
  },
  {
    title: "Test squares",
    description: "Hail hits vs. the repair threshold.",
    icon: SquareCheckIcon,
    iconBg: "bg-gradient-to-br from-success to-success/80",
    tag: "Hail",
    gridClass: "lg:col-start-5 lg:row-start-1",
    compact: true,
  },
  {
    title: "Photo evidence",
    description: "GPS-stamped photos with slope context.",
    icon: CameraIcon,
    iconBg: "bg-gradient-to-br from-primary to-primary/70",
    tag: "Field",
    gridClass: "lg:col-span-2 lg:col-start-4 lg:row-start-2",
    compact: true,
  },
  {
    title: "Damage tags",
    description: "Hail, wind, and flashing by slope.",
    icon: MapPinIcon,
    iconBg: "bg-gradient-to-br from-warning to-warning/80 text-warning-foreground",
    tag: "Findings",
    gridClass: "lg:col-start-1 lg:row-start-3",
    compact: true,
  },
  {
    title: "Staff",
    description: "Invite inspectors. Disable access.",
    icon: UsersIcon,
    iconBg: "bg-gradient-to-br from-primary to-primary/90",
    tag: "Team",
    gridClass: "lg:col-start-2 lg:row-start-3",
    compact: true,
  },
  {
    title: "Branding",
    description: "Logo and colors on the report header.",
    icon: PaletteIcon,
    iconBg: "bg-gradient-to-br from-terracotta to-terracotta/85 text-terracotta-foreground",
    tag: "Brand",
    gridClass: "lg:col-start-3 lg:row-start-3",
    compact: true,
  },
  {
    title: "PDF export",
    description: "Carrier-ready packet in one click.",
    icon: FileTextIcon,
    iconBg: "bg-gradient-to-br from-success to-success/85",
    tag: "Share",
    gridClass: "lg:col-start-4 lg:row-start-3",
    compact: true,
  },
  {
    title: "Platform",
    description: "Tenants, billing, and support tools.",
    icon: ShieldIcon,
    iconBg: "bg-gradient-to-br from-primary/90 to-primary",
    tag: "SaaS",
    gridClass: "lg:col-start-5 lg:row-start-3",
    compact: true,
  },
] as const

const steps = [
  { step: "01", title: "Create your account", description: "Open a company workspace in minutes.", icon: UsersIcon, iconBg: "bg-gradient-to-br from-primary to-primary/70" },
  { step: "02", title: "Capture the roof", description: "Photos, GPS, and test squares on site.", icon: CameraIcon, iconBg: "bg-gradient-to-br from-terracotta to-terracotta/80 text-terracotta-foreground" },
  { step: "03", title: "Verify the storm", description: "Match weather data to the date of loss.", icon: CloudSunIcon, iconBg: "bg-gradient-to-br from-warning to-warning/80 text-warning-foreground" },
  { step: "04", title: "Send the file", description: "Approve and export a branded PDF.", icon: FileTextIcon, iconBg: "bg-gradient-to-br from-success to-success/85" },
]

const stories = [
  { badge: "Fewer reshoots", badgeClass: "bg-success text-success-foreground", quote: "Adjusters stopped asking us to reshoot. GPS and timestamps are on every photo.", name: "Sam Rivera", role: "Summit Ridge Roofing", avatar: "SR" },
  { badge: "Storm flagged", badgeClass: "bg-warning text-warning-foreground", quote: "Mismatch flags keep a weak file from going out. That’s the whole product.", name: "Casey Nguyen", role: "Apex Storm Restoration", avatar: "CN" },
  { badge: "40+ inspectors", badgeClass: "bg-primary text-primary-foreground", quote: "Invites, status, and reports live in one workspace for the whole crew.", name: "Dana Cole", role: "Ironclad Exteriors", avatar: "DC" },
]

function FeatureIcon({
  icon: Icon,
  className,
  large,
  compact,
}: {
  icon: LucideIcon
  className: string
  large?: boolean
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl text-white",
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
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <SiteHeader />

      <main>
        <section className="relative border-b px-4 py-16 sm:px-6 md:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_58%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_7%,transparent),transparent_72%)]"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 lg:gap-8">
            <div className="max-w-xl">
              <p className="text-sm font-medium tracking-wide text-primary">
                Inspection evidence platform
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl sm:leading-[1.12]">
                Stronger files
                <br />
                for roofing claims
              </h1>
              <p className="mt-5 text-lg leading-7 text-muted-foreground">
                Capture the roof, verify the storm,
                <br className="hidden sm:inline" />{" "}
                and send a branded report.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-11 px-6" render={<Link href="/signup" />}>
                  Start free trial
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
                <Button size="lg" variant="outline" className="h-11 px-6" render={<Link href="/login" />}>
                  Log in
                </Button>
              </div>
              <ul className="mt-10 flex flex-col gap-3 text-sm text-muted-foreground">
                {["GPS on every photo", "Storm date check", "Branded PDF export"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="hero-float relative h-[300px] w-[300px] shrink-0 sm:h-[360px] sm:w-[360px] lg:h-[420px] lg:w-[420px]">
                <svg
                  viewBox="0 0 420 420"
                  className="hero-orbit pointer-events-none absolute inset-0 h-full w-full text-terracotta"
                  aria-hidden
                >
                  <defs>
                    <path
                      id="hero-claim-path"
                      d="M 210,210 m -188,0 a 188,188 0 1,1 376,0 a 188,188 0 1,1 -376,0"
                    />
                  </defs>
                  <circle
                    cx="210"
                    cy="210"
                    r="204"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.55"
                    strokeWidth="1.5"
                  />
                  <text
                    fill="currentColor"
                    fontSize="13"
                    fontWeight="600"
                    letterSpacing="2.4"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    <textPath href="#hero-claim-path">
                      Carrier-ready evidence for the insurance claim  ·  Carrier-ready evidence for the insurance claim  ·
                    </textPath>
                  </text>
                  <circle
                    cx="210"
                    cy="210"
                    r="172"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.7"
                    strokeWidth="1.5"
                    strokeDasharray="6 14"
                  />
                  <circle cx="210" cy="38" r="5" fill="var(--terracotta)" />
                </svg>
                <div className="absolute inset-[36px] overflow-hidden rounded-full border bg-card shadow-sm sm:inset-[42px]">
                  <img
                    src="/images/hero-roof.jpg"
                    alt="Residential roof ready for inspection"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-primary/8 to-transparent" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <div className="max-w-xl">
              <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Why RoofClaim
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                One workspace for the roof, the office, and the{" "}
                <span className="text-terracotta">carrier file</span>
              </h2>
              <ul className="mt-8 flex flex-col gap-4">
                {whyPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle2Icon className="mt-0.5 size-6 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8" render={<Link href="/#how-it-works" />}>
                See how it works
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
            <div className="overflow-hidden rounded-3xl">
              <Image
                src="/images/section-storm.png"
                alt="Storm-damaged residential roof"
                width={1100}
                height={820}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            {pillars.map((item) => (
              <article key={item.title} className="overflow-hidden rounded-2xl border bg-card">
                <Image src={item.src} alt={item.title} width={720} height={440} className="aspect-[16/10] w-full object-cover" />
                <div className="p-5">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-primary px-8 py-10 text-primary-foreground md:flex-row md:items-center md:px-12">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Ready to send a cleaner claim file?</h2>
              <p className="mt-2 text-sm text-primary-foreground/75">Open a company workspace. Platform admin signs in separately.</p>
            </div>
            <Button
              size="lg"
              className="h-11 shrink-0 rounded-full bg-terracotta px-7 text-terracotta-foreground hover:bg-terracotta/90"
              render={<Link href="/signup" />}
            >
              Start free trial
            </Button>
          </div>
        </section>

        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-terracotta/10 to-transparent" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                One dashboard for the entire{" "}
                <span className="text-primary">claims operation</span>
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">
                Company admins run jobs, staff, and branding. Platform admins run tenants and billing.
              </p>
              <Button className="mt-8" render={<Link href="/login?role=company" />}>
                Open company portal
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
            <div className="overflow-hidden rounded-3xl">
              <Image
                src="/images/section-claims.png"
                alt="Insurance claims documentation on a property"
                width={1100}
                height={820}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 bg-muted/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <ZapIcon className="size-3.5" />
                Company + platform toolkit
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Everything you need to{" "}
                <span className="text-terracotta">file the claim</span>
              </h2>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:auto-rows-[minmax(9.5rem,auto)]">
              {features.map((feature) => {
                const compact = "compact" in feature && feature.compact
                const featured = "featured" in feature && feature.featured
                return (
                  <article
                    key={feature.title}
                    className={cn(
                      "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-4 transition-all hover:-translate-y-1 hover:border-primary/25",
                      featured && "border-primary/20 bg-gradient-to-br from-primary/[0.07] via-card to-card p-6 md:p-7",
                      feature.gridClass,
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <FeatureIcon icon={feature.icon} className={feature.iconBg} large={featured} compact={compact} />
                      <span className={cn("rounded-full border bg-muted/50 font-semibold tracking-wide text-muted-foreground uppercase", compact ? "px-1.5 py-0.5 text-[9px]" : "px-2.5 py-0.5 text-[11px]")}>
                        {feature.tag}
                      </span>
                    </div>
                    <h3 className={cn("mt-3 font-semibold", featured && "mt-5 text-xl md:text-2xl", compact && "text-sm")}>{feature.title}</h3>
                    <p className={cn("mt-1.5 text-muted-foreground", featured ? "text-sm md:text-base" : "text-xs")}>{feature.description}</p>
                    {featured && (
                      <Image
                        src="/images/before-after-storm.png"
                        alt=""
                        width={800}
                        height={420}
                        className="mt-5 aspect-[16/8] w-full rounded-xl object-cover"
                      />
                    )}
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Get started in minutes</h2>
              <p className="mt-4 text-muted-foreground">Four steps from the roof to the carrier</p>
            </div>
            <div className="relative mt-16">
              <div className="absolute inset-x-0 top-7 hidden h-px bg-border md:block" />
              <div className="grid gap-10 md:grid-cols-4">
                {steps.map((item) => (
                  <div key={item.step} className="relative flex flex-col items-center text-center">
                    <div className={cn("relative z-10 flex size-14 items-center justify-center rounded-2xl text-white", item.iconBg)}>
                      <item.icon className="size-6" />
                    </div>
                    <p className="mt-6 text-xs font-bold tracking-wider text-muted-foreground">STEP {item.step}</p>
                    <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 max-w-[220px] text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-20 bg-muted/30 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
              <p className="mt-4 text-muted-foreground">Seat-based plans for roofing companies</p>
            </div>
            <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3">
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={cn(
                    "flex flex-col rounded-2xl border bg-card p-6",
                    plan.highlight && "border-primary ring-2 ring-primary/20 md:scale-[1.03]",
                  )}
                >
                  {plan.highlight && (
                    <span className="mb-3 w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-3 text-3xl font-bold tracking-tight">
                    ${plan.price}
                    <span className="text-base font-normal text-muted-foreground"> / mo</span>
                  </p>
                  <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-8 w-full" variant={plan.highlight ? "default" : "outline"} render={<Link href="/signup" />}>
                    Get started
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Used by crews who <span className="text-primary">file claims</span>
            </h2>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {stories.map((item) => (
                <blockquote key={item.name} className="relative rounded-2xl border bg-card p-6">
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
              ))}
            </div>
          </div>
        </section>

        <section id="portals" className="scroll-mt-20 border-t bg-card/40 py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {[
              { title: "Evidence-grade photos", text: "GPS and time on every file.", icon: CameraIcon, iconBg: "bg-gradient-to-br from-primary to-primary/70" },
              { title: "Priority support", text: "Help when a claim is on the clock.", icon: HeadphonesIcon, iconBg: "bg-gradient-to-br from-terracotta to-terracotta/80 text-terracotta-foreground" },
              { title: "Secure workspace", text: "Role-based company and platform access.", icon: ShieldIcon, iconBg: "bg-gradient-to-br from-success to-success/85" },
              { title: "Same-day setup", text: "Invite inspectors and start a job.", icon: ZapIcon, iconBg: "bg-gradient-to-br from-warning to-warning/80 text-warning-foreground" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center">
                <FeatureIcon icon={item.icon} className={item.iconBg} />
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl border border-terracotta/30 bg-gradient-to-br from-terracotta/10 via-background to-primary/8 p-8 text-center md:p-16 dark:from-terracotta/15 dark:via-background dark:to-background dark:border-terracotta/20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to tighten the claim file?</h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Start a company trial or log in as platform admin.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" className="h-12 rounded-xl px-8" render={<Link href="/signup" />}>
                  Get started free
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-xl bg-card px-8" render={<Link href="/login" />}>
                  Log in
                </Button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">Company signup · Platform admin login · Role-based portals</p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
