import type { UserRole, UserStatus } from "@/types/role"

export type UserProfile = {
  firstName: string
  lastName: string
  phone: string
  avatarUrl: string
  licenseNumber?: string
  certifications?: Array<{
    name: string
    issuer?: string
    number?: string
    issuedAt?: string | null
    expiresAt?: string | null
  }>
}

export type AuthUser = {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  companyId: string | null
  permissions?: string[]
  profile: UserProfile
}

export type User = {
  id: string
  name: string
  email: string
  role: "platform" | "company"
}
