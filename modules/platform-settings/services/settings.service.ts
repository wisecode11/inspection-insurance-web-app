import { endpoints } from "@/lib/api/endpoints"
import { apiGet, apiPost } from "@/lib/api/request"
import {
  getTemplateMock,
  listCitationsMock,
  listFlagsMock,
  saveCitationsMock,
  saveFlagsMock,
  saveTemplateMock,
} from "@/modules/platform-settings/mocks/settings.mock"
import type { Citation, FeatureFlag, PlatformTemplate } from "@/modules/platform-settings/types/settings.types"

export const settingsService = {
  flags: () => apiGet(endpoints.settings.flags, listFlagsMock),
  saveFlags: (flags: FeatureFlag[]) => apiPost(endpoints.settings.flags, flags, saveFlagsMock),
  citations: () => apiGet(endpoints.settings.citations, listCitationsMock),
  saveCitations: (citations: Citation[]) =>
    apiPost(endpoints.settings.citations, citations, saveCitationsMock),
  template: () => apiGet(endpoints.settings.template, getTemplateMock),
  saveTemplate: (template: PlatformTemplate) =>
    apiPost(endpoints.settings.template, template, saveTemplateMock),
}
