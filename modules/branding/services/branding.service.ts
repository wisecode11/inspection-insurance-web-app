import { endpoints } from "@/lib/api/endpoints"
import { apiGet, apiPost } from "@/lib/api/request"
import { getBrandingMock, saveBrandingMock } from "@/modules/branding/mocks/branding.mock"
import type { CompanyBranding } from "@/modules/branding/types/branding.types"

export const brandingService = {
  get: () => apiGet(endpoints.branding.get, getBrandingMock),
  save: (payload: CompanyBranding) => apiPost(endpoints.branding.save, payload, saveBrandingMock),
}
