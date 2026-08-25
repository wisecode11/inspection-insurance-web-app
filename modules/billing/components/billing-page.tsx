"use client"

import * as React from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getErrorMessage } from "@/lib/api/errors"
import { billingService } from "@/modules/billing/services/billing.service"
import type { BillingInvoice, BillingOverview } from "@/modules/billing/types/billing.types"
import { DownloadIcon } from "lucide-react"

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

function invoiceDownloadUrl(invoice: BillingInvoice) {
  return invoice.pdfUrl || invoice.hostedInvoiceUrl || ""
}

export default function BillingPage() {
  const [overview, setOverview] = React.useState<BillingOverview | null>(null)
  const [invoices, setInvoices] = React.useState<BillingInvoice[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [busy, setBusy] = React.useState(false)

  async function reload() {
    const [nextOverview, nextInvoices] = await Promise.all([
      billingService.overview(),
      billingService.invoices(),
    ])
    setOverview(nextOverview)
    setInvoices(nextInvoices.invoices)
  }

  React.useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams(window.location.search)
        const sessionId = params.get("session_id") || undefined
        if (params.get("checkout") === "success") {
          toast.success("Stripe Checkout completed. Syncing your subscription…")
          if (sessionId) {
            await billingService.syncCheckout(sessionId)
          }
          window.history.replaceState({}, "", window.location.pathname)
        }
        await reload()
      } catch (caught) {
        setError(getErrorMessage(caught))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  async function openPortal() {
    setBusy(true)
    setError("")
    try {
      const { portalUrl } = await billingService.openBillingPortal()
      window.location.assign(portalUrl)
    } catch (caught) {
      setError(getErrorMessage(caught))
      setBusy(false)
    }
  }

  async function simulateNextPeriod() {
    setBusy(true)
    setError("")
    try {
      const result = await billingService.advanceTestClock()
      toast.success(
        `Stripe period advanced. Status: ${result.subscriptionStatus || "synced"} · Invoices: ${result.invoiceCount ?? "—"}`,
      )
      if (result.overview) {
        setOverview(result.overview)
      }
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
  const card = overview?.paymentMethod
  const hasCard = Boolean(card?.brand && card?.last4)

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Subscription"
        description="Your active plan, card on file, and invoices. Renewals run automatically via Stripe."
        // actions={
        //   <Button variant="outline" disabled={busy} onClick={simulateNextPeriod}>
        //     {busy ? "Simulating…" : "Simulate next billing period"}
        //   </Button>
        // }
      />

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active subscription</CardTitle>
            <CardDescription>Current plan synced from Stripe.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-2xl font-semibold">{sub?.plan?.name || "No active subscription"}</p>
            <p className="text-sm capitalize text-muted-foreground">
              {sub?.status?.replaceAll("_", " ") || "inactive"}
              {sub?.interval ? ` · ${sub.interval}` : ""}
              {sub?.cancelAtPeriodEnd ? " · cancels at period end" : ""}
            </p>
            {sub ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Period: {formatDate(sub.currentPeriodStart)} → {formatDate(sub.currentPeriodEnd)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Next renewal: {formatDate(sub.nextBillingDate || sub.currentPeriodEnd)}
                </p>
              </>
            ) : null}
            {sub?.trialEnd ? (
              <p className="text-sm text-muted-foreground">Trial ends: {formatDate(sub.trialEnd)}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card on file</CardTitle>
            <CardDescription>Payment method used for renewals.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm capitalize">
              {hasCard
                ? `${card?.brand} ···· ${card?.last4}`
                : "No card on file yet"}
              {card?.expMonth && card?.expYear ? ` · exp ${card.expMonth}/${card.expYear}` : ""}
            </p>
            <Button variant="outline" disabled={busy} onClick={openPortal} className="w-fit">
              Manage card
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Invoice history</CardTitle>
          <CardDescription>Invoices from Stripe.</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {invoices.map((invoice) => {
                const downloadUrl = invoiceDownloadUrl(invoice)
                return (
                  <li
                    key={invoice.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{invoice.number || invoice.id}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {invoice.status} · {formatDate(invoice.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatMoney(invoice.total, invoice.currency)}
                      </p>
                      {downloadUrl ? (
                        <Button
                          size="sm"
                          variant="outline"
                          render={
                            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download />
                          }
                        >
                          <DownloadIcon data-icon="inline-start" />
                          Download
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">No file</span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  )
}
