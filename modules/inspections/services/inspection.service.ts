import { endpoints } from "@/lib/api/endpoints"
import { apiGet, apiPost } from "@/lib/api/request"
import {
  approveInspectionMock,
  getInspectionMock,
  inspectionDamageTagsMock,
  inspectionPhotosMock,
  inspectionTestSquaresMock,
  listInspectionsMock,
} from "@/modules/inspections/mocks/inspection.mock"
import type { Inspection } from "@/modules/inspections/types/inspection.types"

export const inspectionService = {
  list: () => apiGet(endpoints.inspections.list, listInspectionsMock),
  getById: (id: string) => apiGet(endpoints.inspections.byId(id), () => getInspectionMock(id)),
  photos: (inspection: Inspection) =>
    apiGet(endpoints.inspections.photos(inspection.id), () => inspectionPhotosMock(inspection)),
  damageTags: (inspection: Inspection) =>
    apiGet(endpoints.inspections.damageTags(inspection.id), () => inspectionDamageTagsMock(inspection)),
  testSquares: (inspection: Inspection) =>
    apiGet(endpoints.inspections.testSquares(inspection.id), () => inspectionTestSquaresMock(inspection)),
  approve: (id: string) => apiPost(endpoints.inspections.approve(id), undefined, () => approveInspectionMock(id)),
}
