import { StarIcon } from "lucide-react"

import { BackToTop } from "@/components/marketing/back-to-top"
import { DashboardShowcase } from "@/components/marketing/dashboard-showcase"
import { FeaturesSection } from "@/components/marketing/features-section"
import { FinalCta } from "@/components/marketing/final-cta"
import { HomeHero } from "@/components/marketing/home-hero"
import { Reveal } from "@/components/marketing/reveal"
import { RoofJourney } from "@/components/marketing/roof-journey"
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome"
import { TiltCard } from "@/components/marketing/tilt-card"
import { WorkflowHubSection } from "@/components/marketing/workflow-hub-section"
import { cn } from "@/lib/utils"

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
        <HomeHero />

        <RoofJourney />

        <WorkflowHubSection />

        <DashboardShowcase />

        <FeaturesSection />

        <section className="relative overflow-hidden py-20 md:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="text-center">
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Field-tested</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Used by crews who <span className="text-shimmer">file claims</span>
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {stories.map((item, i) => (
                <Reveal key={item.name} delay={i * 0.08} className="h-full">
                  <TiltCard className="h-full rounded-2xl">
                    <blockquote className="relative h-full overflow-hidden rounded-2xl border bg-card p-6 shadow-[0_20px_45px_-30px_rgba(6,55,40,0.45)] transition-[border-color,box-shadow] duration-300 hover:border-primary/30 hover:shadow-[0_28px_55px_-28px_rgba(6,55,40,0.55)]">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -top-6 -left-1 font-serif text-[7rem] leading-none text-primary/10 select-none"
                      >
                        &ldquo;
                      </span>
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
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <FinalCta />
      </main>

      <SiteFooter />
      <BackToTop />
    </div>
  )
}
