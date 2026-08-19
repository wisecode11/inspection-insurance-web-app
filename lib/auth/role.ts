import type { Role } from "@/types/role"

export function parseRole(value: string | null | undefined): Role | null {
  return value === "platform" || value === "company" ? value : null
}
