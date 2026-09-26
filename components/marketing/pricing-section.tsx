import { PricingExpandCards } from "@/components/marketing/pricing-expand-cards"
import { plansMock as plans } from "@/modules/platform-billing/mocks/billing.mock"

export function PricingSection() {
  return (
  <section id="pricing" className="scroll-mt-20 bg-muted/30 py-20 md:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
        <p className="mt-4 text-muted-foreground">Seat-based plans for roofing companies</p>
      </div>
      <PricingExpandCards plans={plans} />
    </div>
  </section>
  )
}
