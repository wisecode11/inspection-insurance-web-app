import type { Metadata } from "next"

import { DashboardShowcase } from "@/components/marketing/dashboard-showcase"
import { MarketingPage } from "@/components/marketing/marketing-page"
import { PortalsSection } from "@/components/marketing/portals-section"

export const metadata: Metadata = {
  title: "Portals — RoofClaim",
  description: "Role-based company and platform portals for the entire claims operation.",
}

export default function PortalsPage() {
  return (
    <MarketingPage
      eyebrow="Portals"
      title="One workspace, the right access for every role"
      description="Company admins run jobs, staff, and branding. Platform admins run tenants and billing."
    >
      <DashboardShowcase />
      <PortalsSection />
    </MarketingPage>
  )
}
