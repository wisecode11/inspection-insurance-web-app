export type CompanySummary = {
  id: string
  name: string
  slug: string
  legalName: string
  status: string
  hasAccess: boolean
  subscriptionRequired: boolean
  planId: string | null
}

export type Company = {
  id: string
  name: string
}
