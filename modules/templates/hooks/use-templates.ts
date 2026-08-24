"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { templateService } from "@/modules/templates/services/template.service"

async function loadTemplatesWorkspace() {
  const [reportTemplate, citations] = await Promise.all([
    templateService.ensureDefault(),
    templateService.listCitations(),
  ])

  const templates = await templateService.list()
  return {
    templates: templates.length ? templates : [reportTemplate],
    citations,
  }
}

export function useTemplates() {
  return useAsyncData(loadTemplatesWorkspace, "templates-workspace")
}
