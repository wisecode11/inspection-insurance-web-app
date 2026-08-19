import type { ActivityItem } from "@/modules/company-dashboard/types/activity.types"

export function listCompanyActivityMock(): ActivityItem[] {
  return [
    { id: "a-1", actor: "Marta Flynn", action: "approved report", target: "RC-2041 · 482 Maple Crest Dr", time: "8m ago", tone: "approved" },
    { id: "a-2", actor: "Devon Ross", action: "submitted inspection", target: "RC-2040 · 17 Birchwood Ln", time: "42m ago", tone: "submitted" },
    { id: "a-3", actor: "Weather service", action: "flagged mismatch on", target: "RC-2039 · 9021 Sunset Ridge", time: "1h ago", tone: "mismatch" },
    { id: "a-4", actor: "Priya Shah", action: "uploaded 51 photos to", target: "RC-2039 · 9021 Sunset Ridge", time: "1h ago", tone: "pending" },
    { id: "a-5", actor: "System", action: "claim denied by carrier for", target: "RC-2034 · 218 Cedar Bluff", time: "3h ago", tone: "failed" },
    { id: "a-6", actor: "Leo Martin", action: "started draft for", target: "RC-2037 · 1145 Copperfield Way", time: "5h ago", tone: "draft" },
  ]
}
