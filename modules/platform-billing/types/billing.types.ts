export type BillingRow = {
  id: string
  tenant: string
  plan: string
  status: "paid" | "past_due" | "trial" | "canceled"
  mrr: number
  seats: number
  nextInvoice: string
  failedPayments: number
}

export type Plan = {
  name: string
  price: number
  seats: number
  tenants: number
  features: string[]
  highlight: boolean
}
