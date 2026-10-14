import { Suspense } from "react"

import StaffPage from "@/modules/staff/components/staff-page"
import { LoadingState } from "@/components/shared/resource-state"

/** StaffPage reads search params (e.g. ?history=), which needs a Suspense boundary to prerender. */
export default function CompanyStaffRoute() {
  return (
    <Suspense fallback={<LoadingState label="Loading staff…" />}>
      <StaffPage />
    </Suspense>
  )
}
