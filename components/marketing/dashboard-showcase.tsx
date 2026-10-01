import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Reveal } from "@/components/marketing/reveal"
import { Button } from "@/components/ui/button"

export function DashboardShowcase() {
  return (
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
      <Reveal delay={0.1} className="lg:justify-self-end">
        <div className="relative ml-auto w-full max-w-[48rem] pb-6 lg:-mr-2 lg:translate-x-4 xl:translate-x-8">
          <div
            aria-hidden
            className="pointer-events-none absolute top-[6%] left-[6%] h-[80%] w-[88%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_26%,transparent),transparent_70%)] blur-3xl"
          />
          <Image
            src="/laptop-view.png"
            alt="RoofClaim admin overview dashboard on tablet and desktop"
            width={1152}
            height={864}
            sizes="(max-width: 1024px) 92vw, 48rem"
            className="relative z-10 ml-auto h-auto w-full select-none drop-shadow-[0_40px_70px_-34px_rgba(6,55,40,0.6)]"
            priority={false}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-0 left-1/2 h-5 w-[86%] -translate-x-1/2 rounded-[100%] bg-primary-dark/25 blur-xl"
          />
        </div>
      </Reveal>
    </div>
  </section>
  )
}
