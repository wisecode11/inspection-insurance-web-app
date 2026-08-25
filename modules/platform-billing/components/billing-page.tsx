"use client"

import * as React from "react"
import { PlusIcon, TrendingDownIcon } from "lucide-react"
import { toast } from "@/lib/toast"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge, type StatusVariant } from "@/components/shared/status-badge"
import { KpiCard } from "@/components/shared/kpi-card"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/api/errors"
import { cn } from "@/lib/utils"
import { useBilling } from "@/modules/platform-billing/hooks/use-billing"
import { billingService } from "@/modules/platform-billing/services/billing.service"
import type { BillingRow, PlatformPlan } from "@/modules/platform-billing/types/billing.types"
import { DollarSignIcon, RotateCcwIcon } from "lucide-react"

const billingStatus: Record<BillingRow["status"], StatusVariant> = {
  paid: "paid",
  past_due: "past_due",
  trial: "trial",
  canceled: "canceled",
  none: "none",
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  monthlyAmount: "149",
  yearlyAmount: "1490",
  trialDays: "14",
  seats: "5",
  inspectionsPerMonth: "500",
  storageGb: "20",
}

export default function BillingPage() {
  const { data, isLoading, error, reload } = useBilling()
  const billingRows = data?.rows ?? []
  const plans = data?.plans ?? []

  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm)

  if (isLoading) return <LoadingState label="Loading billing…" />
  if (error) return <ErrorState message={error} />

  const mrr = billingRows.reduce((sum, row) => sum + (row.status === "paid" ? row.mrr : 0), 0)
  const failed = billingRows.filter((r) => r.failedPayments > 0).length
  const subscribed = billingRows.filter((r) => r.status !== "none").length
  const churned = billingRows.filter((r) => r.status === "canceled").length
  const churnRate = subscribed ? ((churned / Math.max(billingRows.length, 1)) * 100).toFixed(1) : "0.0"

  const companyColumns: Column<BillingRow>[] = [
    {
      key: "tenant",
      header: "Company",
      sortable: true,
      accessor: (r) => r.tenant,
      cell: (r) => <span className="font-medium">{r.tenant}</span>,
    },
    { key: "plan", header: "Plan", sortable: true, accessor: (r) => r.plan },
    {
      key: "status",
      header: "Subscription",
      sortable: true,
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={billingStatus[r.status]} />,
    },
    {
      key: "mrr",
      header: "MRR",
      sortable: true,
      accessor: (r) => r.mrr,
      align: "right",
      cell: (r) => <span className="tabular-nums">${r.mrr.toLocaleString()}</span>,
    },
    {
      key: "failedPayments",
      header: "Failed payments",
      sortable: true,
      accessor: (r) => r.failedPayments,
      align: "right",
      cell: (r) => (
        <span className={cn("tabular-nums", r.failedPayments > 0 && "font-medium text-danger")}>
          {r.failedPayments}
        </span>
      ),
    },
    {
      key: "nextInvoice",
      header: "Next invoice",
      cell: (r) => <span className="text-muted-foreground tabular-nums">{r.nextInvoice}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-28",
      cell: (r) =>
        r.failedPayments > 0 ? (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await billingService.retry(r.id)
              toast.success(`Retry checked for ${r.tenant}`)
              await reload()
            }}
          >
            <RotateCcwIcon data-icon="inline-start" />
            Retry
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ]

  const planColumns: Column<PlatformPlan>[] = [
    {
      key: "name",
      header: "Plan",
      sortable: true,
      accessor: (p) => p.name,
      cell: (p) => (
        <div className="flex flex-col">
          <span className="font-medium">{p.name}</span>
          <span className="text-xs text-muted-foreground">{p.slug}</span>
        </div>
      ),
    },
    {
      key: "price",
      header: "Monthly",
      sortable: true,
      accessor: (p) => p.price,
      cell: (p) => <span className="tabular-nums">${p.price}</span>,
    },
    {
      key: "yearlyPrice",
      header: "Annual",
      sortable: true,
      accessor: (p) => p.yearlyPrice,
      cell: (p) => <span className="tabular-nums">${p.yearlyPrice}</span>,
    },
    {
      key: "seats",
      header: "Seats",
      accessor: (p) => p.seats,
      cell: (p) => <span className="tabular-nums">{p.seats || "—"}</span>,
    },
    {
      key: "trialDays",
      header: "Trial days",
      accessor: (p) => p.trialDays,
      cell: (p) => <span className="tabular-nums">{p.trialDays}</span>,
    },
    {
      key: "stripe",
      header: "Stripe",
      cell: (p) => (
        <StatusBadge status={p.stripeProductId ? "synced" : "pending"} label={p.stripeProductId ? "Synced" : "Pending"} />
      ),
    },
  ]

  async function handleCreate() {
    setBusy(true)
    try {
      const name = form.name.trim()
      if (!name) throw new Error("Plan name is required")
      const monthlyAmount = Number(form.monthlyAmount)
      if (!monthlyAmount || monthlyAmount < 0) throw new Error("Monthly price is required")

      await billingService.createPlan({
        name,
        slug: form.slug.trim() || slugify(name),
        description: form.description.trim(),
        monthlyAmount,
        yearlyAmount: Number(form.yearlyAmount) || Math.round(monthlyAmount * 10),
        trialDays: Number(form.trialDays) || 14,
        seats: Number(form.seats) || 5,
        inspectionsPerMonth: Number(form.inspectionsPerMonth) || 500,
        storageGb: Number(form.storageGb) || 20,
      })
      toast.success("Subscription plan created. Company admins can now choose it.")
      setOpen(false)
      setForm(emptyForm)
      await reload()
    } catch (caught) {
      toast.error(getErrorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Super admin"
        title="Subscription Management"
        description="Create subscription plans for company admins, then track which companies have subscribed."
        actions={
          <Button onClick={() => setOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            Create subscription
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Platform MRR" value={`$${mrr.toLocaleString()}`} icon={DollarSignIcon} />
        <KpiCard label="Failed payments" value={String(failed)} icon={RotateCcwIcon} helper="accounts needing retry" />
        <KpiCard
          label="Monthly churn"
          value={`${churnRate}%`}
          icon={TrendingDownIcon}
          helper={`${churned} cancelled subscriptions`}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Subscription plans</CardTitle>
            <CardDescription>
              Plans you create here appear on the company admin “Choose a subscription” screen.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => setOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            Create subscription
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={plans}
            columns={planColumns}
            rowKey={(p) => p.id}
            searchPlaceholder="Search plans…"
            searchKeys={["name", "slug"]}
            emptyTitle="No subscription plans yet"
            emptyDescription="Create a plan so company admins can subscribe during onboarding."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company subscriptions</CardTitle>
          <CardDescription>Only companies that completed Stripe Checkout show an active plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={billingRows}
            columns={companyColumns}
            rowKey={(r) => r.id}
            searchPlaceholder="Search companies…"
            searchKeys={["tenant", "plan", "status"]}
            emptyTitle="No companies yet"
            emptyDescription="Companies appear here after they create an organization."
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create subscription plan</DialogTitle>
            <DialogDescription>
              This creates a plan in your database and syncs Product/Prices to Stripe. Company admins will see it
              when choosing a subscription.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="plan-name">Plan name</Label>
              <Input
                id="plan-name"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value
                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug: prev.slug && prev.slug !== slugify(prev.name) ? prev.slug : slugify(name),
                  }))
                }}
                placeholder="Pro"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="plan-slug">Slug</Label>
              <Input
                id="plan-slug"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                placeholder="pro"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="plan-description">Description</Label>
              <Input
                id="plan-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="For growing roofing teams"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="monthly">Monthly price (USD)</Label>
              <Input
                id="monthly"
                type="number"
                min={0}
                value={form.monthlyAmount}
                onChange={(e) => setForm((prev) => ({ ...prev, monthlyAmount: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="yearly">Annual price (USD)</Label>
              <Input
                id="yearly"
                type="number"
                min={0}
                value={form.yearlyAmount}
                onChange={(e) => setForm((prev) => ({ ...prev, yearlyAmount: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trial">Trial days</Label>
              <Input
                id="trial"
                type="number"
                min={0}
                value={form.trialDays}
                onChange={(e) => setForm((prev) => ({ ...prev, trialDays: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="seats">Seats</Label>
              <Input
                id="seats"
                type="number"
                min={1}
                value={form.seats}
                onChange={(e) => setForm((prev) => ({ ...prev, seats: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inspections">Inspections / month</Label>
              <Input
                id="inspections"
                type="number"
                min={0}
                value={form.inspectionsPerMonth}
                onChange={(e) => setForm((prev) => ({ ...prev, inspectionsPerMonth: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storage">Storage (GB)</Label>
              <Input
                id="storage"
                type="number"
                min={1}
                value={form.storageGb}
                onChange={(e) => setForm((prev) => ({ ...prev, storageGb: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={busy} onClick={handleCreate}>
              {busy ? "Creating…" : "Create subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
