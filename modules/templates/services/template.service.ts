import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type {
  ChecklistTemplate,
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

  async create(payload: Partial<ReportTemplate> & { name: string }): Promise<ReportTemplate> {
    const response = await apiClient.post(endpoints.templates.create, payload)
    return unwrap<{ template: ReportTemplate }>(response.data).template
  },

  async update(id: string, payload: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const response = await apiClient.patch(endpoints.templates.byId(id), payload)
    return unwrap<{ template: ReportTemplate }>(response.data).template
  },

  async listChecklists(): Promise<ChecklistTemplate[]> {
    const response = await apiClient.get(endpoints.codes.checklists)
    return unwrap<{ checklists: ChecklistTemplate[] }>(response.data).checklists
  },

  async ensureDefaultChecklist(): Promise<ChecklistTemplate> {
    const response = await apiClient.get(endpoints.codes.checklistDefault)
    return unwrap<{ checklist: ChecklistTemplate }>(response.data).checklist
  },

  async createChecklist(
    payload: Partial<ChecklistTemplate> & { name: string }
  ): Promise<ChecklistTemplate> {
    const response = await apiClient.post(endpoints.codes.checklists, payload)
    return unwrap<{ checklist: ChecklistTemplate }>(response.data).checklist
  },

  async updateChecklist(
    id: string,
    payload: Partial<ChecklistTemplate>
  ): Promise<ChecklistTemplate> {
    const response = await apiClient.patch(endpoints.codes.checklist(id), payload)
    return unwrap<{ checklist: ChecklistTemplate }>(response.data).checklist
  },

  async listCitations(): Promise<CodeCitationOption[]> {
    const response = await apiClient.get(endpoints.codes.citations)
    return unwrap<{ citations: CodeCitationOption[] }>(response.data).citations
  },
}
