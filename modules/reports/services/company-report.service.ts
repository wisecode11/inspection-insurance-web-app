import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type { CompanyReport, ReportPdfVersion } from "@/modules/reports/types/report.types"

export type EvidenceShare = {
  id: string
  channel: string
  recipient: string
  expiresAt?: string | null
  allowDownload: boolean
  url: string
  token: string
  pdfUrl?: string
}

export const companyReportService = {
  async list(status?: string) {
    const response = await apiClient.get(endpoints.reports.list, {
      params: status ? { status } : undefined,
    })
    return unwrap<{ reports: CompanyReport[] }>(response.data).reports
  },

  async getById(id: string) {
    const response = await apiClient.get(endpoints.reports.byId(id))
    return unwrap<{ report: CompanyReport }>(response.data).report
  },

  async submit(id: string) {
    const response = await apiClient.post(endpoints.reports.submit(id))
    return unwrap<{ report: CompanyReport }>(response.data).report
  },

  async startReview(id: string) {
    const response = await apiClient.post(endpoints.reports.startReview(id))
    return unwrap<{ report: CompanyReport }>(response.data).report
  },

  async approve(id: string, notes?: string) {
    const response = await apiClient.post(endpoints.reports.approve(id), { notes })
    return unwrap<{ report: CompanyReport }>(response.data).report
  },

  async reject(id: string, reason?: string) {
    const response = await apiClient.post(endpoints.reports.reject(id), { reason })
    return unwrap<{ report: CompanyReport }>(response.data).report
  },

  async requestChanges(id: string, notes?: string) {
    const response = await apiClient.post(endpoints.reports.requestChanges(id), { notes })
    return unwrap<{ report: CompanyReport }>(response.data).report
  },

  async share(id: string) {
    const response = await apiClient.post(endpoints.reports.shareById(id), {})
    return unwrap<{ share: EvidenceShare; report: CompanyReport }>(response.data)
  },

  /** All PDFs this report has held, newest first. */
  async pdfVersions(id: string) {
    const response = await apiClient.get(endpoints.reports.pdfVersions(id))
    return unwrap<{ report: CompanyReport; versions: ReportPdfVersion[] }>(response.data)
  },

  /** One PDF version's bytes (authenticated request, so it works for older versions too). */
  async pdfVersionBlob(id: string, version: number) {
    const response = await apiClient.get<Blob>(endpoints.reports.pdfVersion(id, version), {
      responseType: "blob",
      timeout: 120000,
    })
    return response.data
  },

  async generateForJob(jobId: string, narrative?: string) {
    const response = await apiClient.post(endpoints.reports.generate(jobId), { narrative })
    return unwrap<{ report: CompanyReport }>(response.data).report
  },
}
