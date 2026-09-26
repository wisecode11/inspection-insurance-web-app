import type { Metadata } from "next"

import { MarketingPage } from "@/components/marketing/marketing-page"
import { PricingSection } from "@/components/marketing/pricing-section"

export const metadata: Metadata = {
  title: "Pricing — RoofClaim",
  description: "Simple, seat-based plans for roofing and restoration companies.",
}

export default function PricingPage() {
  return (
    <MarketingPage
      eyebrow="Pricing"
      title="Simple, transparent pricing"
      description="Seat-based plans for roofing companies. Start with a free trial and upgrade when your crew grows."
    >
      <PricingSection />
    </MarketingPage>
  )
}
