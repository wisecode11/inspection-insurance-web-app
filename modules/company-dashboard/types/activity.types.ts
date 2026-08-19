import type { StatusVariant } from "@/components/shared/status-badge"

export type ActivityItem = {
  id: string
  actor: string
  action: string
  target: string
  time: string
  tone: StatusVariant
}
