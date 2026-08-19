import type { CompanyBranding } from "@/modules/branding/types/branding.types"

let branding: CompanyBranding = {
  company: "Summit Ridge Roofing",
  address: "1840 Blake Street, Denver, CO 80202",
  license: "CO-RC-44192",
  primary: "#0F4C81",
  accent: "#F59E0B",
  logoName: null,
}

export function getBrandingMock(): CompanyBranding {
  return { ...branding }
}

export function saveBrandingMock(next: CompanyBranding): CompanyBranding {
  branding = { ...next }
  return getBrandingMock()
}
