"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { jobService } from "@/modules/inspections/services/job.service"

export function useJobs() {
  return useAsyncData(() => jobService.list(), "jobs")
}
