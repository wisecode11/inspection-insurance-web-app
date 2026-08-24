import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type {
  CodeCitationOption,
  ReportTemplate,
} from "@/modules/templates/types/template.types"

export const templateService = {
  async list(): Promise<ReportTemplate[]> {
    const response = await apiClient.get(endpoints.templates.list)
    return unwrap<{ templates: ReportTemplate[] }>(response.data).templates
  },

  async ensureDefault(): Promise<ReportTemplate> {
    const response = await apiClient.get(endpoints.templates.default)
    return unwrap<{ template: ReportTemplate }>(response.data).template
  },

  async update(id: string, payload: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const response = await apiClient.patch(endpoints.templates.byId(id), payload)
    return unwrap<{ template: ReportTemplate }>(response.data).template
  },

  async listCitations(): Promise<CodeCitationOption[]> {
    const response = await apiClient.get(endpoints.codes.citations)
    return unwrap<{ citations: CodeCitationOption[] }>(response.data).citations
  },
}
