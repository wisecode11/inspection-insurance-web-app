import { endpoints } from "@/lib/api/endpoints"
import { apiGet, apiPost } from "@/lib/api/request"
import { getTemplatesMock, saveTemplatesMock } from "@/modules/templates/mocks/template.mock"
import type { TemplateSet } from "@/modules/templates/types/template.types"

export const templateService = {
  get: () => apiGet(endpoints.templates.get, getTemplatesMock),
  save: (payload: TemplateSet) => apiPost(endpoints.templates.save, payload, saveTemplatesMock),
}
