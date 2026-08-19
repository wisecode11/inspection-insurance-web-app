export type SupportTicket = {
  id: string
  subject: string
  tenant: string
  priority: "critical" | "pending" | "open"
  status: "open" | "pending" | "resolved"
  updated: string
  requester: string
}
