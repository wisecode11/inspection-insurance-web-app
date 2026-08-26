import type { BillingMode } from "@/modules/onboarding/services/billing-plan.service"
import type { BillingOptionCopy, CatalogPlan } from "@/modules/onboarding/types/onboarding.types"

function legacyBullets(plan: CatalogPlan) {
  const bullets = ["Unlimited inspector seats", "Unlimited inspections"]

  if (plan.features.weatherVerification) bullets.push("Weather verification")
  if (plan.features.customTemplates) bullets.push("Custom branding & templates")
  if (plan.features.analytics) bullets.push("Company analytics")
  if (plan.features.prioritySupport) bullets.push("Priority support")
  else bullets.push("Email support")

  return bullets
}

function optionForMode(plan: CatalogPlan, mode: BillingMode): BillingOptionCopy | undefined {
  const options = plan.billingOptions
  if (!options) return undefined
  if (mode === "trial") return options.trial
  if (mode === "yearly") return options.annual
  return options.monthly
}

/** Marketing copy for the selected billing option (trial / monthly / annual). */
export function planOptionContent(plan: CatalogPlan, mode: BillingMode) {
  const option = optionForMode(plan, mode)
  const bullets =
    option?.bullets?.length ? option.bullets : legacyBullets(plan)
  const description = option?.description || plan.description || ""

  let pricePrimary = ""
  let priceSecondary = ""

  if (mode === "trial") {
    pricePrimary = "$0"
    priceSecondary = ""
  } else if (mode === "yearly") {
    pricePrimary = `$${plan.yearlyPrice}`
    priceSecondary = " / yr"
  } else {
    pricePrimary = `$${plan.price}`
    priceSecondary = " / mo"
  }

  return { description, bullets, pricePrimary, priceSecondary }
}

/** @deprecated prefer planOptionContent(plan, mode) */
export function planBullets(plan: CatalogPlan) {
  return planOptionContent(plan, "monthly").bullets
}
