import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type {
  JobDetail,
  JobInput,
  JobPriority,
  JobRow,
  JobStatus,
} from "@/modules/inspections/types/job.types"

export const jobService = {
  async list() {
    const response = await apiClient.get(endpoints.jobs.list)
    return unwrap<{ jobs: JobRow[] }>(response.data).jobs
  },

  async getById(id: string) {
    const response = await apiClient.get(endpoints.jobs.byId(id))
    return unwrap<{ job: JobDetail }>(response.data).job
  },

  async create(input: JobInput) {
    const response = await apiClient.post(endpoints.jobs.create, input)
    return unwrap<{ job: JobRow }>(response.data).job
  },

  async update(
    id: string,
    input: Partial<JobInput> & { unassign?: boolean; priority?: JobPriority; dueDate?: string | null },
  ) {
    const response = await apiClient.patch(endpoints.jobs.update(id), input)
    return unwrap<{ job: JobRow }>(response.data).job
  },

  async assign(id: string, inspectorId: string, extras?: { dueDate?: string | null; priority?: JobPriority }) {
    const response = await apiClient.patch(endpoints.jobs.assign(id), {
      inspectorId,
      ...extras,
    })
    return unwrap<{ job: JobRow }>(response.data).job
  },

  async bulkAssign(
    jobIds: string[],
    inspectorId: string,
    extras?: { dueDate?: string | null; priority?: JobPriority },
  ) {
    const response = await apiClient.post(endpoints.jobs.bulkAssign, {
      jobIds,
      inspectorId,
      ...extras,
    })
    return unwrap<{ jobs: JobRow[] }>(response.data).jobs
  },

  async unassign(id: string) {
    const response = await apiClient.patch(endpoints.jobs.unassign(id))
    return unwrap<{ job: JobRow }>(response.data).job
  },

  async setStatus(id: string, status: JobStatus) {
    const response = await apiClient.patch(endpoints.jobs.status(id), { status })
    return unwrap<{ job: JobRow }>(response.data).job
  },

  async cancel(id: string, reason?: string) {
    const response = await apiClient.post(endpoints.jobs.cancel(id), { reason })
    return unwrap<{ job: JobRow }>(response.data).job
  },
}
