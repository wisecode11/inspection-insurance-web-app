"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { brandingService } from "@/modules/branding/services/branding.service"

export function useBranding() {
  return useAsyncData(() => brandingService.get(), "branding")
}
