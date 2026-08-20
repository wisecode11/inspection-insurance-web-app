"use client"

import * as React from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/api/errors"
import { cn } from "@/lib/utils"
import { billingService } from "@/modules/billing/services/billing.service"
import type {
  BillingInvoice,
  BillingOverview,
} from "@/modules/billing/types/billing.types"
import type { CatalogPlan } from "@/modules/onboarding/types/onboarding.types"

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString()
}

function usageLabel(used: number, limit: number) {
  if (!limit) return `${used} / ∞`
  return `${used} / ${limit}`
}

export default function BillingPage() {
  const [overview, setOverview] = React.useState<BillingOverview | null>(null)
  const [plans, setPlans] = React.useState<CatalogPlan[]>([])
  const [invoices, setInvoices] = React.useState<BillingInvoice[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [interval, setInterval] = React.useState<"monthly" | "yearly">("monthly")
  const [card, setCard] = React.useState({
    brand: "visa",
    last4: "",
    expMonth: "",
    expYear: "",
  })

  async function reload() {
    const [nextOverview, nextPlans, nextInvoices] = await Promise.all([
      billingService.overview(),
      billingService.plans(),
      billingService.invoices(),
    ])
    setOverview(nextOverview)
    setPlans(nextPlans.plans)
    setInvoices(nextInvoices.invoices)
    if (nextOverview.subscription?.interval === "yearly") setInterval("yearly")
    if (nextOverview.paymentMethod?.last4) {
      setCard({
        brand: nextOverview.paymentMethod.brand || "visa",
        last4: nextOverview.paymentMethod.last4,
        expMonth: String(nextOverview.paymentMethod.expMonth || ""),
        expYear: String(nextOverview.paymentMethod.expYear || ""),
      })
    }
  }

  React.useEffect(() => {
    reload()
      .catch((caught) => setError(getErrorMessage(caught)))
      .finally(() => setLoading(false))
  }, [])

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError("")
    try {
      await action()
      await reload()
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <LoadingState label="Loading subscription…" />
  if (!overview && error) return <ErrorState message={error} />

  const sub = overview?.subscription
  const usage = overview?.usage

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Subscription"
        description="Manage plan, Stripe billing, invoices, payment method, and usage limits for your company."
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current plan</CardTitle>
            <CardDescription>Free trial, monthly, or annual — one subscription per company.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <p className="text-2xl font-semibold">{sub?.plan?.name || "No plan"}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {sub?.status?.replaceAll("_", " ") || "inactive"}
                {sub?.interval ? ` · ${sub.interval}` : ""}
                {sub?.cancelAtPeriodEnd ? " · cancels at period end" : ""}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Period: {formatDate(sub?.currentPeriodStart)} → {formatDate(sub?.currentPeriodEnd)}
            </p>
            {sub?.trialEnd && (
              <p className="text-sm text-muted-foreground">Trial ends: {formatDate(sub.trialEnd)}</p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="outline"
                disabled={busy || !sub}
                onClick={() =>
                  run(async () => {
                    await billingService.cancel(false)
                    toast.success("Cancellation scheduled at period end")
                  })
                }
              >
                Cancel at period end
              </Button>
              <Button
                variant="destructive"
                disabled={busy || !sub}
                onClick={() =>
                  run(async () => {
                    await billingService.cancel(true)
                    toast.success("Subscription cancelled")
                  })
                }
              >
                Cancel now
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage limits</CardTitle>
            <CardDescription>Tracked against your plan for this billing period.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Seats</p>
              <p className="text-lg font-semibold tabular-nums">
                {usageLabel(usage?.seatsUsed || 0, usage?.seatsLimit || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Inspections</p>
              <p className="text-lg font-semibold tabular-nums">
                {usageLabel(usage?.inspectionsThisPeriod || 0, usage?.inspectionsLimit || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reports</p>
              <p className="text-lg font-semibold tabular-nums">
                {usageLabel(usage?.reportsThisPeriod || 0, usage?.reportsLimit || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Storage</p>
              <p className="text-lg font-semibold tabular-nums">
                {((usage?.storageBytes || 0) / (1024 * 1024 * 1024)).toFixed(2)} /{" "}
                {usage?.storageGbLimit || 0} GB
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Upgrade / downgrade</CardTitle>
          <CardDescription>Change plan or billing interval. Local Stripe invoice is created on change.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              variant={interval === "monthly" ? "default" : "outline"}
              onClick={() => setInterval("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={interval === "yearly" ? "default" : "outline"}
              onClick={() => setInterval("yearly")}
            >
              Annual
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {plans.map((plan) => {
              const current = sub?.plan?.id === plan.id
              const price = interval === "yearly" ? plan.yearlyPrice : plan.price
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "flex flex-col rounded-xl border p-4",
                    current ? "border-terracotta ring-1 ring-terracotta/30" : "border-border",
                  )}
                >
                  <p className="font-semibold">{plan.name}</p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatMoney(price, plan.currency)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {interval === "yearly" ? " / yr" : " / mo"}
                    </span>
                  </p>
                  <Button
                    className="mt-4"
                    disabled={busy || current}
                    onClick={() =>
                      run(async () => {
                        await billingService.changePlan(plan.id, interval)
                        toast.success(`Switched to ${plan.name}`)
                      })
                    }
                  >
                    {current ? "Current plan" : "Switch to this plan"}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment method</CardTitle>
            <CardDescription>Stripe card on file (local provider until live Stripe keys are wired).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Brand</Label>
              <Input
                value={card.brand}
                onChange={(e) => setCard((prev) => ({ ...prev, brand: e.target.value }))}
                placeholder="visa"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Last 4</Label>
              <Input
                value={card.last4}
                maxLength={4}
                onChange={(e) => setCard((prev) => ({ ...prev, last4: e.target.value }))}
                placeholder="4242"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Exp month</Label>
              <Input
                value={card.expMonth}
                onChange={(e) => setCard((prev) => ({ ...prev, expMonth: e.target.value }))}
                placeholder="12"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Exp year</Label>
              <Input
                value={card.expYear}
                onChange={(e) => setCard((prev) => ({ ...prev, expYear: e.target.value }))}
                placeholder="2030"
              />
            </div>
            <div className="sm:col-span-2">
              <Button
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await billingService.updatePaymentMethod({
                      brand: card.brand || "visa",
                      last4: card.last4,
                      expMonth: Number(card.expMonth),
                      expYear: Number(card.expYear),
                    })
                    toast.success("Payment method saved")
                  })
                }
              >
                Save payment method
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice history</CardTitle>
            <CardDescription>Local Stripe invoices for this company.</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet.</p>
            ) : (
              <ul className="flex flex-col divide-y">
                {invoices.map((invoice) => (
                  <li key={invoice.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{invoice.number || invoice.id}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {invoice.status} · {formatDate(invoice.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatMoney(invoice.total, invoice.currency)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
