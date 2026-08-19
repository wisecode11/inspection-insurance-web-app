"use client"

import { CheckIcon, TrendingDownIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge, type StatusVariant } from "@/components/shared/status-badge"
import { KpiCard } from "@/components/shared/kpi-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useBilling } from "@/modules/platform-billing/hooks/use-billing"
import { billingService } from "@/modules/platform-billing/services/billing.service"
import type { BillingRow } from "@/modules/platform-billing/types/billing.types"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { DollarSignIcon, RotateCcwIcon, UsersIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const billingStatus: Record<BillingRow["status"], StatusVariant> = {
  paid: "paid",
  past_due: "past_due",
  trial: "trial",
  canceled: "canceled",
}

const columns: Column<BillingRow>[] = [
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
            toast.success(`Retry queued for ${r.tenant}`)
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

export default function BillingPage() {
  const { data, isLoading, error } = useBilling()
  const billingRows = data?.rows ?? []
  const plans = data?.plans ?? []
  const tenants = data?.tenants ?? []

  if (isLoading) return <LoadingState label="Loading billing…" />
  if (error) return <ErrorState message={error} />

  const mrr = tenants.reduce((sum, t) => sum + t.mrr, 0)
  const failed = billingRows.filter((r) => r.failedPayments > 0).length
  const churned = tenants.filter((t) => t.status === "suspended").length
  const churnRate = ((churned / tenants.length) * 100).toFixed(1)

  return (
    <>
      <PageHeader
        eyebrow="Platform admin"
        title="Plans & billing"
        description="Seat limits, subscription health, failed payments, and platform churn."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Platform MRR" value={`$${mrr.toLocaleString()}`} icon={DollarSignIcon} delta={8.2} deltaLabel="vs last month" />
        <KpiCard label="Failed payments" value={String(failed)} icon={RotateCcwIcon} helper="accounts needing retry" />
        <KpiCard label="Monthly churn" value={`${churnRate}%`} icon={TrendingDownIcon} helper={`${churned} suspended tenants`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={cn(plan.highlight && "ring-2 ring-primary/30")}>
            <CardHeader>
              <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {plan.highlight ? "Most used" : "Tier"}
              </p>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                  ${plan.price}
                </span>
                <span> / month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Up to {plan.seats} seats · {plan.tenants} tenants on this plan
              </p>
              <ul className="flex flex-col gap-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <UsersIcon className="size-3.5" />
                Seat limit {plan.seats === 60 ? "unlimited" : plan.seats}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing table</CardTitle>
          <CardDescription>Subscription status, MRR, and failed payment retries</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={billingRows}
            columns={columns}
            rowKey={(r) => r.id}
            searchPlaceholder="Search subscriptions…"
            searchKeys={["tenant", "plan", "status"]}
            emptyTitle="No billing rows"
            emptyDescription="No subscriptions match this search."
          />
        </CardContent>
      </Card>
    </>
  )
}
