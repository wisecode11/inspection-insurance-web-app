import { listTenantsMock } from "@/modules/platform-tenants/mocks/tenant.mock"
import type { BillingRow, Plan } from "@/modules/platform-billing/types/billing.types"

export const plansMock: Plan[] = [
  {
    name: "Starter",
    price: 149,
    seats: 5,
    tenants: 4,
    features: ["Up to 5 inspector seats", "500 inspections / mo", "Standard report templates", "Email support"],
    highlight: false,
  },
  {
    name: "Pro",
    price: 499,
    seats: 15,
    tenants: 5,
    features: ["Up to 15 inspector seats", "2,500 inspections / mo", "Custom branding & templates", "Weather verification API", "Priority support"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: 1499,
    seats: 60,
    tenants: 3,
    features: ["Unlimited seats", "Unlimited inspections", "Advanced code-citation library", "SSO & audit logs", "Dedicated success manager"],
    highlight: false,
  },
]

export function listPlansMock(): Plan[] {
  return plansMock.map((row) => ({ ...row, features: [...row.features] }))
}

export function listBillingMock(): BillingRow[] {
  return listTenantsMock().map((t) => ({
    id: `inv-${t.id}`,
    tenant: t.name,
    plan: t.plan,
    status: t.status === "suspended" ? "past_due" : t.status === "trial" ? "trial" : "paid",
    mrr: t.mrr,
    seats: t.seatsTotal,
    nextInvoice: "2026-09-01",
    failedPayments: t.status === "suspended" ? 2 : 0,
  }))
}
