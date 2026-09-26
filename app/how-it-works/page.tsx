import type { Metadata } from "next"

import { MarketingPage } from "@/components/marketing/marketing-page"
import { UserGuideSteps } from "@/components/marketing/user-guide-steps"

export const metadata: Metadata = {
  title: "How it works — RoofClaim",
  description: "From signup to a carrier-ready file in four steps.",
}

export default function HowItWorksPage() {
  return (
    <MarketingPage
      eyebrow="How it works"
      title="From signup to carrier-ready file"
      description="Set up your company, send inspectors out, verify the storm, and export a branded report."
    >
      <UserGuideSteps />
    </MarketingPage>
  )
}
