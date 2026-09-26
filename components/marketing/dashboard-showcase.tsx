import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { LaptopMockup } from "@/components/marketing/laptop-mockup"
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
      <Reveal delay={0.1}>
        <LaptopMockup />
      </Reveal>
    </div>
  </section>
  )
}
