"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { officeStaffService } from "@/modules/staff/services/staff.service"
import { getStoredUser } from "@/lib/auth/user-storage"

export function useOfficeStaff() {
  const user = typeof window !== "undefined" ? getStoredUser() : null
  const enabled = user?.role === "company_admin"
  return useAsyncData(
    () => (enabled ? officeStaffService.list() : Promise.resolve([])),
    enabled ? "office-staff" : "office-staff-disabled",
  )
}
