import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type { JobInput, JobRow } from "@/modules/inspections/types/job.types"

export const jobService = {
  async list() {
    const response = await apiClient.get(endpoints.jobs.list)
    return unwrap<{ jobs: JobRow[] }>(response.data).jobs
  },

  async create(input: JobInput) {
    const response = await apiClient.post(endpoints.jobs.create, input)
    return unwrap<{ job: JobRow }>(response.data).job
  },
}
