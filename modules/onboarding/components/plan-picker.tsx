"use client"

import * as React from "react"
import { CheckCircle2Icon, Loader2Icon } from "lucide-react"

import { AuthFrame } from "@/components/auth/auth-frame"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/api/errors"
import { persistSession } from "@/lib/auth/session"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"
import { OnboardingSteps } from "@/modules/onboarding/components/onboarding-steps"
import { billingPlanService } from "@/modules/onboarding/services/billing-plan.service"
import type { CatalogPlan } from "@/modules/onboarding/types/onboarding.types"
import { planBullets } from "@/modules/onboarding/utils/plan-bullets"

type BillingMode = "trial" | "monthly" | "yearly"

const MODES: Array<{ id: BillingMode; label: string; hint: string }> = [
  { id: "trial", label: "Free trial", hint: "14 days, then convert" },
  { id: "monthly", label: "Monthly", hint: "Billed each month" },
  { id: "yearly", label: "Annual", hint: "Billed once a year" },
]

export function PlanPicker() {
  const [plans, setPlans] = React.useState<CatalogPlan[]>([])
  const [selectedId, setSelectedId] = React.useState("")
  const [mode, setMode] = React.useState<BillingMode>("trial")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [buying, setBuying] = React.useState(false)

  React.useEffect(() => {
    billingPlanService
      .list()
      .then(({ plans: rows }) => {
        setPlans(rows)
        setSelectedId(rows.find((row) => row.highlight)?.id ?? rows[0]?.id ?? "")
      })
      .catch((caught) => setError(getErrorMessage(caught)))
      .finally(() => setLoading(false))
  }, [])

  async function handleBuy() {
    if (!selectedId) return
    setError("")
    setBuying(true)
    try {
      const payload = await billingPlanService.start(selectedId, mode)
      await persistSession(payload)
      window.location.assign(ROUTES.company.dashboard)
    } catch (caught) {
      setError(getErrorMessage(caught))
      setBuying(false)
    }
  }

  const selected = plans.find((plan) => plan.id === selectedId)
  const cta =
    mode === "trial"
      ? "Start free trial"
      : mode === "yearly"
        ? "Buy annual plan"
        : "Buy monthly plan"

  return (
    <AuthFrame
      title="Choose a subscription"
      description="Pick a plan and billing option. Stripe billing is recorded locally until live keys are connected."
      role="company"
      wide
    >
      <OnboardingSteps current="plan" />
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Loading plans…
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid gap-2 sm:grid-cols-3">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-colors",
                  mode === item.id
                    ? "border-terracotta bg-terracotta/10 ring-1 ring-terracotta/30"
                    : "border-border hover:border-terracotta/40",
                )}
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.hint}</p>
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {plans.map((plan) => {
              const isSelected = plan.id === selectedId
              const price =
                mode === "yearly" ? plan.yearlyPrice : plan.price
              const suffix = mode === "yearly" ? " / yr" : " / mo"
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedId(plan.id)}
                  className={cn(
                    "flex flex-col rounded-2xl border bg-card p-5 text-left transition-colors",
                    isSelected
                      ? "border-terracotta ring-2 ring-terracotta/25"
                      : "border-border hover:border-terracotta/40",
                    plan.highlight && "md:scale-[1.02]",
                  )}
                >
                  {plan.highlight && (
                    <span className="mb-2 w-fit rounded-full bg-terracotta px-2.5 py-0.5 text-[11px] font-semibold text-terracotta-foreground">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {mode === "trial" ? "$0" : `$${price}`}
                    <span className="text-base font-normal text-muted-foreground">
                      {mode === "trial" ? ` then $${plan.price}/mo` : suffix}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  <ul className="mt-4 flex flex-1 flex-col gap-2">
                    {planBullets(plan).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-terracotta" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>
          {selected && mode === "trial" && selected.trialDays <= 0 && (
            <Alert>
              <AlertDescription>This plan has no free trial. Choose Monthly or Annual.</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            className="h-10 w-full bg-terracotta text-terracotta-foreground hover:bg-terracotta/90 md:w-auto md:self-end"
            disabled={!selectedId || buying || (mode === "trial" && (selected?.trialDays ?? 0) <= 0)}
            onClick={handleBuy}
          >
            {buying && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
            {cta}
          </Button>
        </div>
      )}
    </AuthFrame>
  )
}
