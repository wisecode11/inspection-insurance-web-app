import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type { CompanyBranding } from "@/modules/branding/types/branding.types"

type CompanyMe = {
  company: {
    name: string
    branding?: {
      logoUrl?: string
      companyDisplayName?: string
      footerText?: string
      primaryColor?: string
      accentColor?: string
      tagline?: string
    }
    contact?: {
      email?: string
      phone?: string
      website?: string
      address?: {
        line1?: string
        city?: string
        state?: string
        postalCode?: string
      }
    }
  }
}

function mapCompany(company: CompanyMe["company"]): CompanyBranding {
  const address = company.contact?.address
  const addressLine = [address?.line1, address?.city, address?.state, address?.postalCode]
    .filter(Boolean)
    .join(", ")

  return {
    logoUrl: company.branding?.logoUrl || "",
    companyDisplayName: company.branding?.companyDisplayName || company.name || "",
    footerText: company.branding?.footerText || "",
    primaryColor: company.branding?.primaryColor || "#2D6A4F",
    accentColor: company.branding?.accentColor || "#40916C",
    tagline: company.branding?.tagline || "",
    contact: {
      email: company.contact?.email || "",
      phone: company.contact?.phone || "",
      website: company.contact?.website || "",
      addressLine,
    },
  }
}

export const brandingService = {
  async get(): Promise<CompanyBranding> {
    const response = await apiClient.get(endpoints.companies.me)
    const data = unwrap<CompanyMe>(response.data)
    return mapCompany(data.company)
  },

  async save(payload: {
    companyDisplayName: string
    footerText: string
    primaryColor: string
    accentColor: string
    tagline?: string
    logoUrl?: string
    contact?: {
      email?: string
      phone?: string
      website?: string
    }
  }): Promise<CompanyBranding> {
    const response = await apiClient.patch(endpoints.companies.update, {
      branding: {
        companyDisplayName: payload.companyDisplayName,
        footerText: payload.footerText,
        primaryColor: payload.primaryColor,
        accentColor: payload.accentColor,
        tagline: payload.tagline || "",
        logoUrl: payload.logoUrl,
      },
      contact: payload.contact
        ? {
            email: payload.contact.email,
            phone: payload.contact.phone,
            website: payload.contact.website,
          }
        : undefined,
    })
    const data = unwrap<CompanyMe>(response.data)
    return mapCompany(data.company)
  },
}
