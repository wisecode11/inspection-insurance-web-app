import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type {
  InspectorHistoryItem,
  StaffInput,
  StaffMember,
} from "@/modules/staff/types/staff.types"

export const staffService = {
  async list() {
    const response = await apiClient.get(endpoints.staff.list)
    return unwrap<{ inspectors: StaffMember[] }>(response.data).inspectors
  },

  async create(input: StaffInput) {
    const response = await apiClient.post(endpoints.staff.create, input)
    return unwrap<{ inspector: StaffMember; emailSent: boolean }>(response.data)
  },

  async update(id: string, input: Partial<StaffInput>) {
    const response = await apiClient.patch(endpoints.staff.byId(id), input)
    return unwrap<{ inspector: StaffMember }>(response.data).inspector
  },

  async setStatus(id: string, status: "active" | "suspended" | "deactivated") {
    const response = await apiClient.patch(endpoints.staff.status(id), { status })
    return unwrap<{ inspector: StaffMember }>(response.data).inspector
  },

  async deactivate(id: string) {
    return this.setStatus(id, "deactivated")
  },

  async resetPassword(id: string, password?: string) {
    const response = await apiClient.post(endpoints.staff.resetPassword(id), {
      password: password || undefined,
    })
    return unwrap<{
      inspector: StaffMember
      emailSent: boolean
      temporaryPassword?: string
    }>(response.data)
  },

  async reassignJobs(id: string, toInspectorId: string, jobIds?: string[]) {
    const response = await apiClient.post(endpoints.staff.reassignJobs(id), {
      toInspectorId,
      jobIds,
    })
    return unwrap<{ count: number }>(response.data)
  },

  async history(id: string) {
    const response = await apiClient.get(endpoints.staff.history(id))
    return unwrap<{ inspector: StaffMember; history: InspectorHistoryItem[] }>(response.data)
  },
}

export type { StaffMember, StaffInput, InspectorHistoryItem }
