"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { templateService } from "@/modules/templates/services/template.service"

export function useTemplates() {
  return useAsyncData(() => templateService.get(), "templates")
}
