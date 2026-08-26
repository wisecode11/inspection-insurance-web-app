"use client"

import * as React from "react"
import { MoreHorizontalIcon, PlusIcon, TrendingDownIcon } from "lucide-react"
import { toast } from "@/lib/toast"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge, type StatusVariant } from "@/components/shared/status-badge"
import { KpiCard } from "@/components/shared/kpi-card"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getErrorMessage } from "@/lib/api/errors"
import { cn } from "@/lib/utils"
import { useBilling } from "@/modules/platform-billing/hooks/use-billing"
import { billingService } from "@/modules/platform-billing/services/billing.service"
import type { BillingRow, CreatePlanInput, PlatformPlan } from "@/modules/platform-billing/types/billing.types"
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

function parseBullets(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function bulletsText(bullets?: string[]) {
  return Array.isArray(bullets) ? bullets.join("\n") : ""
}

const emptyForm = {
  name: "",
  slug: "",
  trialDays: "14",
  trialPriceLabel: "$0",
  trialDescription: "",
  trialBullets: "",
  monthlyAmount: "149",
  monthlyDescription: "",
  monthlyBullets: "",
  yearlyAmount: "1490",
  annualDescription: "",
  annualBullets: "",
}

function formFromPlan(plan: PlatformPlan) {
  return {
    name: plan.name,
    slug: plan.slug,
    trialDays: String(plan.trialDays ?? 14),
    trialPriceLabel: plan.billingOptions?.trial.priceLabel || "$0",
    trialDescription: plan.billingOptions?.trial.description || "",
    trialBullets: bulletsText(plan.billingOptions?.trial.bullets),
    monthlyAmount: String(plan.price ?? 149),
    monthlyDescription: plan.billingOptions?.monthly.description || plan.description || "",
    monthlyBullets: bulletsText(plan.billingOptions?.monthly.bullets),
    yearlyAmount: String(plan.yearlyPrice ?? 1490),
    annualDescription: plan.billingOptions?.annual.description || "",
    annualBullets: bulletsText(plan.billingOptions?.annual.bullets),
  }
}

function buildPlanInput(form: typeof emptyForm): CreatePlanInput {
  const monthlyAmount = Number(form.monthlyAmount)
  const monthlyDescription = form.monthlyDescription.trim()
  const trialDescription = form.trialDescription.trim()
  const annualDescription = form.annualDescription.trim()

  return {
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    description: monthlyDescription || trialDescription || annualDescription,
    monthlyAmount,
    yearlyAmount: Number(form.yearlyAmount) || Math.round(monthlyAmount * 10),
    trialDays: Number(form.trialDays) || 14,
    billingOptions: {
      trial: {
        priceLabel: form.trialPriceLabel.trim(),
        description: trialDescription,
        bullets: parseBullets(form.trialBullets),
      },
      monthly: {
        priceLabel: "",
        description: monthlyDescription,
        bullets: parseBullets(form.monthlyBullets),
      },
      annual: {
        priceLabel: "",
        description: annualDescription,
        bullets: parseBullets(form.annualBullets),
      },
    },
  }
}

function stopRowClick(event: React.MouseEvent) {
  event.stopPropagation()
}

type PlanRowActionsProps = {
  plan: PlatformPlan
  onManage: (plan: PlatformPlan) => void
  onToggleActive: (plan: PlatformPlan) => void
  onDelete: (plan: PlatformPlan) => void
}

function PlanRowActions({ plan, onManage, onToggleActive, onDelete }: PlanRowActionsProps) {
  return (
    <div onClick={stopRowClick}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${plan.name}`}>
              <MoreHorizontalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{plan.name}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onManage(plan)}>Manage Subscription</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleActive(plan)}>
              {plan.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(plan)}>
              Delete Subscription
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default function BillingPage() {
  const { data, isLoading, error, reload } = useBilling()
  const billingRows = data?.rows ?? []
  const plans = data?.plans ?? []

  const [open, setOpen] = React.useState(false)
  const [editingPlanId, setEditingPlanId] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm)
  const [formError, setFormError] = React.useState("")

  function openCreate() {
    setEditingPlanId(null)
    setForm(emptyForm)
    setFormError("")
    setOpen(true)
  }

  function openManage(plan: PlatformPlan) {
    setEditingPlanId(plan.id)
    setForm(formFromPlan(plan))
    setFormError("")
    setOpen(true)
  }

  function closeSheet(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setEditingPlanId(null)
      setForm(emptyForm)
      setFormError("")
    }
  }

  async function handleSave() {
    setFormError("")
    setBusy(true)
    try {
      const name = form.name.trim()
      if (!name) throw new Error("Plan name is required")
      const monthlyAmount = Number(form.monthlyAmount)
      if (!monthlyAmount || monthlyAmount < 0) throw new Error("Monthly price is required")

      const input = buildPlanInput(form)
      if (editingPlanId) {
        await billingService.updatePlan(editingPlanId, input)
        toast.success("Subscription plan updated.")
      } else {
        await billingService.createPlan(input)
        toast.success("Subscription plan created. Company admins can now choose it.")
      }
      closeSheet(false)
      await reload()
    } catch (caught) {
      setFormError(getErrorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleActive(plan: PlatformPlan) {
    try {
      await billingService.setPlanActive(plan.id, !plan.isActive)
      toast.success(plan.isActive ? "Plan deactivated." : "Plan activated.")
      await reload()
    } catch (caught) {
      toast.error(getErrorMessage(caught))
    }
  }

  async function handleDelete(plan: PlatformPlan) {
    const confirmed = window.confirm(
      `Delete “${plan.name}”? This removes it from company plans and archives it in Stripe.`,
    )
    if (!confirmed) return
    try {
      await billingService.deletePlan(plan.id)
      toast.success("Subscription plan deleted.")
      await reload()
    } catch (caught) {
      toast.error(getErrorMessage(caught))
    }
  }

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
      key: "trialDays",
      header: "Trial days",
      accessor: (p) => p.trialDays,
      cell: (p) => <span className="tabular-nums">{p.trialDays}</span>,
    },
    {
      key: "isActive",
      header: "Status",
      accessor: (p) => (p.isActive ? "active" : "inactive"),
      cell: (p) => (
        <StatusBadge
          status={p.isActive ? "active" : "suspended"}
          label={p.isActive ? "Active" : "Deactivated"}
        />
      ),
    },
    {
      key: "stripe",
      header: "Stripe",
      cell: (p) => (
        <StatusBadge status={p.stripeProductId ? "synced" : "pending"} label={p.stripeProductId ? "Synced" : "Pending"} />
      ),
    },
    {
      key: "rowActions",
      header: "",
      className: "w-12",
      cell: (p) => (
        <PlanRowActions
          plan={p}
          onManage={openManage}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />
      ),
    },
  ]

  const isEditing = Boolean(editingPlanId)

  return (
    <>
      <PageHeader
        eyebrow="Super admin"
        title="Subscription Management"
        description="Create subscription plans for company admins, then track which companies have subscribed."
        actions={
          <Button onClick={openCreate}>
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
          <Button variant="outline" onClick={openCreate}>
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

      <Sheet open={open} onOpenChange={closeSheet}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{isEditing ? "Manage subscription plan" : "Create subscription plan"}</SheetTitle>
            <SheetDescription>
              Configure Free Trial, Monthly, and Annual separately. Company admins see the content for the
              billing option they select.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-2">
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
            </div>

            <section className="grid gap-3 rounded-lg border border-border p-3">
              <p className="text-sm font-semibold">Free Trial</p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trial-days">Trial days</Label>
                <Input
                  id="trial-days"
                  type="number"
                  min={0}
                  value={form.trialDays}
                  onChange={(e) => setForm((prev) => ({ ...prev, trialDays: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trial-price">Price / details</Label>
                <Input
                  id="trial-price"
                  value={form.trialPriceLabel}
                  onChange={(e) => setForm((prev) => ({ ...prev, trialPriceLabel: e.target.value }))}
                  placeholder="$0"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trial-description">Description</Label>
                <Input
                  id="trial-description"
                  value={form.trialDescription}
                  onChange={(e) => setForm((prev) => ({ ...prev, trialDescription: e.target.value }))}
                  placeholder="Try everything free for 14 days"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trial-bullets">Bullet points (one per line)</Label>
                <Textarea
                  id="trial-bullets"
                  value={form.trialBullets}
                  onChange={(e) => setForm((prev) => ({ ...prev, trialBullets: e.target.value }))}
                  placeholder={"Full feature access during trial\nNo charge until trial ends"}
                />
              </div>
            </section>

            <section className="grid gap-3 rounded-lg border border-border p-3">
              <p className="text-sm font-semibold">Monthly</p>
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
                <Label htmlFor="monthly-description">Description</Label>
                <Input
                  id="monthly-description"
                  value={form.monthlyDescription}
                  onChange={(e) => setForm((prev) => ({ ...prev, monthlyDescription: e.target.value }))}
                  placeholder="Billed every month"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="monthly-bullets">Bullet points (one per line)</Label>
                <Textarea
                  id="monthly-bullets"
                  value={form.monthlyBullets}
                  onChange={(e) => setForm((prev) => ({ ...prev, monthlyBullets: e.target.value }))}
                  placeholder={"Cancel anytime\nAll core features included"}
                />
              </div>
            </section>

            <section className="grid gap-3 rounded-lg border border-border p-3">
              <p className="text-sm font-semibold">Annual</p>
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
                <Label htmlFor="annual-description">Description</Label>
                <Input
                  id="annual-description"
                  value={form.annualDescription}
                  onChange={(e) => setForm((prev) => ({ ...prev, annualDescription: e.target.value }))}
                  placeholder="Save with yearly billing"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="annual-bullets">Bullet points (one per line)</Label>
                <Textarea
                  id="annual-bullets"
                  value={form.annualBullets}
                  onChange={(e) => setForm((prev) => ({ ...prev, annualBullets: e.target.value }))}
                  placeholder={"2 months free\nBest value for growing teams"}
                />
              </div>
            </section>
          </div>

          {formError ? <p className="px-4 text-sm text-danger">{formError}</p> : null}

          <SheetFooter>
            <Button variant="outline" disabled={busy} onClick={() => closeSheet(false)}>
              Cancel
            </Button>
            <Button disabled={busy} onClick={handleSave}>
              {busy ? "Saving…" : isEditing ? "Save changes" : "Create subscription"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
