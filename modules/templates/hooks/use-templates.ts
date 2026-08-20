"use client"

import { useAsyncData } from "@/lib/hooks/use-async-data"
import { templateService } from "@/modules/templates/services/template.service"

async function loadTemplatesWorkspace() {
  const [reportTemplate, checklists, citations] = await Promise.all([
    templateService.ensureDefault(),
    templateService.listChecklists().then(async (rows) => {
      if (rows.length) return rows
      const created = await templateService.ensureDefaultChecklist()
      return [created]
    }),
    templateService.listCitations(),
  ])

  const templates = await templateService.list()
  return {
    templates: templates.length ? templates : [reportTemplate],
    checklists,
    citations,
  }
}

export function useTemplates() {
  return useAsyncData(loadTemplatesWorkspace, "templates-workspace")
}
