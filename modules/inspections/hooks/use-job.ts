"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { jobService } from "@/modules/inspections/services/job.service"

export function useJob(id: string) {
  return useAsyncData(() => jobService.getById(id), `job:${id}`)
}
