export type Tenant = {
  id: string
  name: string
  plan: "Starter" | "Pro" | "Enterprise"
  seatsUsed: number
  seatsTotal: number
  status: "active" | "suspended" | "trial"
  created: string
  mrr: number
  inspections: number
  storageGb: number
  owner: string
  ownerEmail: string
  region: string
}
