import { endpoints } from "@/lib/api/endpoints"
import { apiGet, apiPatch, apiPost } from "@/lib/api/request"
import {
  createStaffMock,
  disableStaffMock,
  listStaffMock,
  updateStaffMock,
} from "@/modules/staff/mocks/staff.mock"
import type { StaffInput, StaffMember } from "@/modules/staff/types/staff.types"

export const staffService = {
  list: () => apiGet(endpoints.staff.list, listStaffMock),
  create: (input: StaffInput) => apiPost(endpoints.staff.list, input, createStaffMock),
  update: (id: string, input: StaffInput) =>
    apiPatch(endpoints.staff.byId(id), input, () => updateStaffMock(id, input)),
  disable: (id: string) =>
    apiPatch(endpoints.staff.byId(id), { status: "suspended" }, () => disableStaffMock(id)),
}

export type { StaffMember, StaffInput }
