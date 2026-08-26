import { endpoints } from "@/lib/api/endpoints"
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/request"
import { listBillingMock } from "@/modules/platform-billing/mocks/billing.mock"
import type {
  BillingRow,
  CreatePlanInput,
  PlatformPlan,
} from "@/modules/platform-billing/types/billing.types"

type ApiBillingRow = {
  id: string
  name: string
  status: string
  plan: string
  mrr: number
  subscriptionStatus?: string
  currentPeriodEnd?: string | null
  lastInvoiceStatus?: string | null
  stripeSubscriptionId?: string
}

type ApiPlan = {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  yearlyPrice: number
  currency: string
  trialDays: number
  limits?: {
    seats?: number
  }
  billingOptions?: {
    trial?: { priceLabel?: string; description?: string; bullets?: string[] }
    monthly?: { priceLabel?: string; description?: string; bullets?: string[] }
    annual?: { priceLabel?: string; description?: string; bullets?: string[] }
  }
  isActive?: boolean
  isPublic?: boolean
  stripe?: {
    productId?: string
    monthlyPriceId?: string
    yearlyPriceId?: string
  }
}

function mapStatus(row: ApiBillingRow): BillingRow["status"] {
  const sub = String(row.subscriptionStatus || "").toLowerCase()
  const hasStripeSub =
    Boolean(row.stripeSubscriptionId) && !String(row.stripeSubscriptionId).startsWith("local_")
  const hasPlan = Boolean(row.plan && row.plan !== "—")

  if (!sub || sub === "none" || (!hasStripeSub && !hasPlan)) return "none"
  if (sub === "trialing" || sub.includes("trial")) return "trial"
  if (sub === "past_due" || sub === "unpaid" || sub.includes("past")) return "past_due"
  if (sub === "cancelled" || sub === "canceled" || sub.includes("cancel")) return "canceled"
  if (sub === "incomplete") return "none"
  if (sub === "active") return "paid"
  return "none"
}

function mapBillingRows(rows: ApiBillingRow[]): BillingRow[] {
  return rows.map((row) => {
    const status = mapStatus(row)
    return {
      id: row.id,
      tenant: row.name,
      plan: status === "none" ? "—" : row.plan || "—",
      status,
      mrr: status === "paid" ? Number(row.mrr) || 0 : 0,
      seats: 0,
      nextInvoice:
        status === "none" || !row.currentPeriodEnd
          ? "—"
          : new Date(row.currentPeriodEnd).toISOString().slice(0, 10),
      failedPayments: status === "past_due" || row.lastInvoiceStatus === "open" ? 1 : 0,
    }
  })
}

function mapOptionCopy(
  option?: { priceLabel?: string; description?: string; bullets?: string[] },
  fallbackDescription = "",
) {
  return {
    priceLabel: option?.priceLabel || "",
    description: option?.description || fallbackDescription || "",
    bullets: Array.isArray(option?.bullets) ? option.bullets.filter(Boolean) : [],
  }
}

function mapPlan(plan: ApiPlan): PlatformPlan {
  const description = plan.description || ""
  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    description,
    price: Number(plan.price) || 0,
    yearlyPrice: Number(plan.yearlyPrice) || 0,
    currency: plan.currency || "USD",
    trialDays: Number(plan.trialDays) || 0,
    billingOptions: {
      trial: mapOptionCopy(plan.billingOptions?.trial, description),
      monthly: mapOptionCopy(plan.billingOptions?.monthly, description),
      annual: mapOptionCopy(plan.billingOptions?.annual, description),
    },
    isActive: plan.isActive !== false,
    isPublic: plan.isPublic !== false,
    stripeProductId: plan.stripe?.productId || "",
  }
}

export const billingService = {
  list: async () => {
    const rows = await apiGet<ApiBillingRow[]>(endpoints.billing.list, listBillingMock)
    return mapBillingRows(Array.isArray(rows) ? rows : [])
  },

  plans: async () => {
    const data = await apiGet<ApiPlan[]>(endpoints.billing.plans, async () => [])
    return (Array.isArray(data) ? data : []).map(mapPlan)
  },

  createPlan: async (input: CreatePlanInput) => {
    const data = await apiPost<ApiPlan, CreatePlanInput>(
      endpoints.billing.createPlan,
      input,
      async () => ({
        id: `plan_${Date.now()}`,
        name: input.name,
        slug: input.slug,
        description: input.description || "",
        price: input.monthlyAmount,
        yearlyPrice: input.yearlyAmount,
        currency: "USD",
        trialDays: input.trialDays,
        billingOptions: input.billingOptions,
        limits: {},
        isActive: true,
        isPublic: true,
        stripe: {},
      }),
    )
    return mapPlan(data)
  },

  updatePlan: async (id: string, input: CreatePlanInput) => {
    const data = await apiPatch<ApiPlan, CreatePlanInput>(
      endpoints.billing.updatePlan(id),
      input,
      async () => ({
        id,
        name: input.name,
        slug: input.slug,
        description: input.description || "",
        price: input.monthlyAmount,
        yearlyPrice: input.yearlyAmount,
        currency: "USD",
        trialDays: input.trialDays,
        billingOptions: input.billingOptions,
        limits: {},
        isActive: true,
        isPublic: true,
        stripe: {},
      }),
    )
    return mapPlan(data)
  },

  setPlanActive: async (id: string, isActive: boolean) => {
    const data = await apiPatch<ApiPlan, { isActive: boolean }>(
      endpoints.billing.planStatus(id),
      { isActive },
      async () => ({
        id,
        name: "Plan",
        slug: "plan",
        description: "",
        price: 0,
        yearlyPrice: 0,
        currency: "USD",
        trialDays: 0,
        isActive,
        isPublic: true,
        stripe: {},
      }),
    )
    return mapPlan(data)
  },

  deletePlan: async (id: string) => {
    await apiDelete<{ id: string }>(endpoints.billing.deletePlan(id), async () => ({ id }))
  },

  retry: (id: string) =>
    apiPost(endpoints.billing.retry(id), undefined, async () => ({ id })),
}
