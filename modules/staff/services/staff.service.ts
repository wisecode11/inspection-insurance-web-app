import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type { StaffInput, StaffMember } from "@/modules/staff/types/staff.types"

export const staffService = {
  async list() {
    const response = await apiClient.get(endpoints.staff.list)
    return unwrap<{ inspectors: StaffMember[] }>(response.data).inspectors
  },

  async create(input: StaffInput) {
    const response = await apiClient.post(endpoints.staff.create, input)
    return unwrap<{ inspector: StaffMember; emailSent: boolean }>(response.data)
  },

  async setStatus(id: string, status: "active" | "suspended") {
    const response = await apiClient.patch(endpoints.staff.status(id), { status })
    return unwrap<{ inspector: StaffMember }>(response.data).inspector
  },

  async remove(id: string) {
    const response = await apiClient.delete(endpoints.staff.byId(id))
    return unwrap<{ id: string }>(response.data)
  },
}

export type { StaffMember, StaffInput }
