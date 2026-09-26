import type { Metadata } from "next"

import { FeaturesSection } from "@/components/marketing/features-section"
import { MarketingPage } from "@/components/marketing/marketing-page"

export const metadata: Metadata = {
  title: "Product — RoofClaim",
  description: "Photo evidence, storm checks, test squares and carrier-ready reports for roofing companies.",
}

export default function FeaturesPage() {
  return (
    <MarketingPage
      eyebrow="Product"
      title="Everything a carrier-ready claim file needs"
      description="Photo evidence, storm checks, and branded reports for your office and every inspector in the field."
    >
      <FeaturesSection />
    </MarketingPage>
  )
}
