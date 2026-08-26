import type { CompanySummary } from "@/types/company"

export type OrganizationInput = {
  name: string
}

export type BillingOptionCopy = {
  priceLabel: string
  description: string
  bullets: string[]
}

export type CatalogPlan = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  yearlyPrice: number
  currency: string
  trialDays: number
  highlight: boolean
  billingOptions?: {
    trial: BillingOptionCopy
    monthly: BillingOptionCopy
    annual: BillingOptionCopy
  }
  limits: {
    seats: number
    inspectionsPerMonth: number
    storageGb: number
    photosPerInspection: number
    reportsPerMonth: number
  }
  features: {
    weatherVerification: boolean
    stormMap: boolean
    customTemplates: boolean
    customChecklists: boolean
    analytics: boolean
    whatsappShare: boolean
    prioritySupport: boolean
  }
}

export type CompanySessionPayload = {
  user: import("@/types/user").AuthUser
  tokens: import("@/modules/auth/types/auth.types").AuthTokens
  company: CompanySummary | null
}
