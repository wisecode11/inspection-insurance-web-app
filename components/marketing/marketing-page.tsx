import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { BackToTop } from "@/components/marketing/back-to-top"
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"

/**
 * Shell for standalone marketing pages (/features, /pricing, ...): header,
 * a short page intro, the page's sections, a closing CTA and the footer.
 */
export function MarketingPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-[radial-gradient(ellipse_at_70%_45%,#f4faf7_0%,#e8f3ed_48%,#dceee6_100%)] dark:bg-none">
          <div className="mx-auto max-w-3xl px-4 pt-16 pb-14 text-center sm:px-6 md:pt-20 md:pb-16">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance text-primary-dark sm:text-5xl dark:text-foreground">
              {title}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {description}
            </p>
          </div>
        </section>

        {children}

        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-primary/8 p-8 text-center md:p-16 dark:border-primary/20 dark:from-primary/15 dark:via-background dark:to-background">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to tighten the claim file?</h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Start a company trial or log in to your portal.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" className="h-12 px-8" render={<Link href={ROUTES.signup} />}>
                  Get started free
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 bg-card px-8" render={<Link href={ROUTES.login} />}>
                  Log in
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <BackToTop />
    </div>
  )
}
