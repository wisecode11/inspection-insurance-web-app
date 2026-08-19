"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { staffService } from "@/modules/staff/services/staff.service"

export function useStaff() {
  return useAsyncData(() => staffService.list(), "staff")
}
