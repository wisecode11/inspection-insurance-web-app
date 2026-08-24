import { ROUTES } from "@/lib/constants/routes"
import type { CompanySummary } from "@/types/company"
import type { Role } from "@/types/role"
import type { AuthUser } from "@/types/user"

export function companyNeedsSubscription(company: CompanySummary | null) {
  if (!company) return false
  if (company.status === "pending_subscription") return true
  return company.subscriptionRequired && company.status !== "trial" && company.status !== "active"
}

export function pathAfterSignup() {
  return ROUTES.onboarding.organization
}

/** Single-company routing: no org → create; needs plan → subscription; else dashboard. */
export function pathForCompany(company: CompanySummary | null) {
  if (!company) return ROUTES.onboarding.organization
  if (companyNeedsSubscription(company)) return ROUTES.onboarding.subscription
  return ROUTES.company.dashboard
}

export function pathAfterLogin(
  user: AuthUser,
  expectedRole: Role,
  company: CompanySummary | null = null,
) {
  if (user.role === "platform_admin") {
    if (expectedRole !== "platform") {
      throw new Error("This account is a platform owner. Sign in at /roofclaim/admin.")
    }
    return ROUTES.superAdmin.users
  }

  if (expectedRole === "platform") {
    throw new Error("This account belongs to a company. Use the company sign-in page.")
  }

  return pathForCompany(company)
}

export function pathAfterOrganization() {
  return ROUTES.onboarding.subscription
}
