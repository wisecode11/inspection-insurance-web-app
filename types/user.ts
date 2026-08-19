import type { Role, UserRole, UserStatus } from "@/types/role"

export type UserProfile = {
  firstName: string
  lastName: string
  phone: string
  avatarUrl: string
}

export type AuthUser = {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  companyId: string | null
  profile: UserProfile
}

export type User = {
  id: string
  name: string
  email: string
  role: Role
}
