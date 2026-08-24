import { Suspense } from "react"

import ReportsPage from "@/modules/reports/components/reports-page"
import { LoadingState } from "@/components/shared/resource-state"

export default function CompanyReportsRoute() {
  return (
    <Suspense fallback={<LoadingState label="Loading reports…" />}>
      <ReportsPage />
    </Suspense>
  )
}
