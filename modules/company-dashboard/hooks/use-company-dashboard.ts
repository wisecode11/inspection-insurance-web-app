"use client"

import * as React from "react"

import { companyDashboardService } from "@/modules/company-dashboard/services/dashboard.service"
import type { CompanyDashboardData } from "@/modules/company-dashboard/types/dashboard.types"
import { getErrorMessage } from "@/lib/api/errors"

export function useCompanyDashboard() {
  const [data, setData] = React.useState<CompanyDashboardData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    let active = true
    companyDashboardService
      .overview()
      .then((payload) => {
        if (active) setData(payload)
      })
      .catch((caught) => {
        if (active) setError(getErrorMessage(caught))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { data, isLoading, error }
}
