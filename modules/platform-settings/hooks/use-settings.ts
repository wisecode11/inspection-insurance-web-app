"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { settingsService } from "@/modules/platform-settings/services/settings.service"

export function useSettings() {
  return useAsyncData(async () => {
    const [flags, citations, template] = await Promise.all([
      settingsService.flags(),
      settingsService.citations(),
      settingsService.template(),
    ])
    return { flags, citations, template }
  }, "settings")
}
