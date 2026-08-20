import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type { JobDetail } from "@/modules/inspections/types/job.types"

export type JobReport = {
  id: string
  jobId: string
  status: string
  pdfStatus?: string
  version: number
  title: string
  narrative: string
  warnings: string[]
  pdfUrl?: string
  generatedAt?: string | null
  submittedAt?: string | null
  reviewedAt?: string | null
  reviewNotes?: string
  rejectionReason?: string
  changesRequested?: string
}

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

export const reportService = {
  async review(jobId: string) {
    const response = await apiClient.get(endpoints.reports.review(jobId))
    return unwrap<{
      job: JobDetail
      report: JobReport
      monitoring: Record<string, boolean>
    }>(response.data)
  },

  async getForJob(jobId: string) {
    const response = await apiClient.get(endpoints.reports.byJob(jobId))
    return unwrap<{ report: JobReport }>(response.data).report
  },

  async updateNarrative(jobId: string, narrative: string) {
    const response = await apiClient.patch(endpoints.reports.narrative(jobId), { narrative })
    return unwrap<{ report: JobReport }>(response.data).report
  },

  async generate(jobId: string, narrative?: string) {
    const response = await apiClient.post(endpoints.reports.generate(jobId), { narrative })
    return unwrap<{ report: JobReport }>(response.data).report
  },

  async share(jobId: string, payload?: { recipient?: string; channel?: string }) {
    const response = await apiClient.post(endpoints.reports.share(jobId), payload || {})
    return unwrap<{ share: EvidenceShare; report: JobReport }>(response.data)
  },
}
