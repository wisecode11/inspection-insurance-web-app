import { ACTIVE_COMPANY_KEY } from "@/lib/auth/constants"
import type { CompanySummary } from "@/types/company"

function canUseStorage() {
  return typeof window !== "undefined"
}

export function saveActiveCompany(company: CompanySummary) {
  if (!canUseStorage()) return
  window.localStorage.setItem(ACTIVE_COMPANY_KEY, JSON.stringify(company))
}

export function getActiveCompany(): CompanySummary | null {
  if (!canUseStorage()) return null
  const raw = window.localStorage.getItem(ACTIVE_COMPANY_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as CompanySummary
  } catch {
    return null
  }
}

export function clearActiveCompany() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(ACTIVE_COMPANY_KEY)
}
