export type BillingRow = {
  id: string
  tenant: string
  plan: string
  status: "paid" | "past_due" | "trial" | "canceled" | "none"
  mrr: number
  seats: number
  nextInvoice: string
  failedPayments: number
}

export type PlatformPlan = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  yearlyPrice: number
  currency: string
  trialDays: number
  seats: number
  inspectionsPerMonth: number
  storageGb: number
  isActive: boolean
  isPublic: boolean
  stripeProductId: string
}

export type CreatePlanInput = {
  name: string
  slug: string
  description?: string
  monthlyAmount: number
  yearlyAmount: number
  trialDays: number
  seats: number
  inspectionsPerMonth: number
  storageGb: number
}

/** @deprecated kept for mock compatibility */
export type Plan = {
  name: string
  price: number
  seats: number
  tenants: number
  features: string[]
  highlight: boolean
}
