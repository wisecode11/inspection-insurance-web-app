export type BillingPlanSummary = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  yearlyPrice: number
  currency: string
  trialDays: number
  highlight: boolean
  limits: {
    seats: number
    inspectionsPerMonth: number
    storageGb: number
    photosPerInspection: number
    reportsPerMonth: number
  }
}

export type CompanySubscription = {
  id: string
  status: string
  interval: "monthly" | "yearly" | string
  seats: number
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  trialStart: string | null
  trialEnd: string | null
  cancelAtPeriodEnd: boolean
  cancelledAt: string | null
  plan: BillingPlanSummary | null
}

export type PaymentMethod = {
  brand: string
  last4: string
  expMonth: number | null
  expYear: number | null
  provider: string
}

export type UsageLimits = {
  seatsUsed: number
  seatsLimit: number
  inspectionsThisPeriod: number
  inspectionsLimit: number
  reportsThisPeriod: number
  reportsLimit: number
  storageBytes: number
  storageGbLimit: number
  periodStart: string | null
  periodEnd: string | null
}

export type BillingOverview = {
  company: { id: string; name: string; status: string }
  subscription: CompanySubscription | null
  paymentMethod: PaymentMethod
  usage: UsageLimits
}

export type BillingInvoice = {
  id: string
  number: string
  status: string
  currency: string
  total: number
  amountPaid: number
  amountDue: number
  periodStart: string | null
  periodEnd: string | null
  paidAt: string | null
  dueDate: string | null
  createdAt: string
}
