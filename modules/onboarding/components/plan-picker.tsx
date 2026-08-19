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

export function PlanPicker() {
  const [plans, setPlans] = React.useState<CatalogPlan[]>([])
  const [selectedId, setSelectedId] = React.useState("")
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
      const payload = await billingPlanService.start(selectedId)
      await persistSession(payload)
      window.location.assign(ROUTES.company.dashboard)
    } catch (caught) {
      setError(getErrorMessage(caught))
      setBuying(false)
    }
  }

  return (
    <AuthFrame
      title="Choose a plan"
      description="Start a 14-day trial. You can change this later."
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
          <div className="grid gap-3 md:grid-cols-3">
            {plans.map((plan) => {
              const selected = plan.id === selectedId
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedId(plan.id)}
                  className={cn(
                    "flex flex-col rounded-2xl border bg-card p-5 text-left transition-colors",
                    selected
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
                    ${plan.price}
                    <span className="text-base font-normal text-muted-foreground"> / mo</span>
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
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            className="h-10 w-full bg-terracotta text-terracotta-foreground hover:bg-terracotta/90 md:w-auto md:self-end"
            disabled={!selectedId || buying}
            onClick={handleBuy}
          >
            {buying && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
            Start trial
          </Button>
        </div>
      )}
    </AuthFrame>
  )
}
