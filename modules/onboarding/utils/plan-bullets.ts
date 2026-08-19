import type { CatalogPlan } from "@/modules/onboarding/types/onboarding.types"

export function planBullets(plan: CatalogPlan) {
  const inspections =
    plan.limits.inspectionsPerMonth === 0
      ? "Unlimited inspections"
      : `${plan.limits.inspectionsPerMonth.toLocaleString()} inspections / mo`

  const bullets = [
    plan.limits.seats >= 60 ? "Unlimited inspector seats" : `Up to ${plan.limits.seats} inspector seats`,
    inspections,
  ]

  if (plan.features.weatherVerification) bullets.push("Weather verification")
  if (plan.features.customTemplates) bullets.push("Custom branding & templates")
  if (plan.features.analytics) bullets.push("Company analytics")
  if (plan.features.prioritySupport) bullets.push("Priority support")
  else bullets.push("Email support")

  return bullets
}
