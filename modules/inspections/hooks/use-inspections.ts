"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { inspectionService } from "@/modules/inspections/services/inspection.service"

export function useInspections() {
  return useAsyncData(() => inspectionService.list(), "inspections")
}

export function useInspection(id: string | undefined) {
  return useAsyncData(
    () => (id ? inspectionService.getById(id) : Promise.resolve(undefined)),
    `inspection-${id ?? "none"}`,
  )
}
