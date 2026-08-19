import type { SupportTicket } from "@/modules/platform-support/types/support.types"

const tickets: SupportTicket[] = [
  { id: "TCK-4821", subject: "PDF export missing test-square photos", tenant: "Ironclad Exteriors", priority: "critical", status: "open", updated: "12m ago", requester: "Dana Cole" },
  { id: "TCK-4820", subject: "Weather API returning mismatch on verified storms", tenant: "Apex Storm Restoration", priority: "critical", status: "open", updated: "48m ago", requester: "Casey Nguyen" },
  { id: "TCK-4816", subject: "Cannot invite new inspector — seat limit", tenant: "Northgate Roof Systems", priority: "pending", status: "pending", updated: "3h ago", requester: "Jamie Ortiz" },
  { id: "TCK-4809", subject: "Request to restore suspended account", tenant: "Blue Sky Contractors", priority: "pending", status: "open", updated: "5h ago", requester: "Riley Fox" },
  { id: "TCK-4801", subject: "Branding logo not showing on report header", tenant: "Cornerstone Roofing", priority: "open", status: "resolved", updated: "1d ago", requester: "Alex Park" },
  { id: "TCK-4795", subject: "Add Colorado hail code citations", tenant: "Summit Ridge Roofing", priority: "open", status: "resolved", updated: "2d ago", requester: "Sam Rivera" },
]

export function listTicketsMock(): SupportTicket[] {
  return tickets.map((row) => ({ ...row }))
}
