import type { AuthUser } from "@/types/user"
import type { CompanySummary } from "@/types/company"

export type AuthTokens = {
  accessToken: string
  refreshToken: string
  tokenType: "Bearer" | string
  expiresIn: number
}

export type AuthPayload = {
  user: AuthUser
  tokens: AuthTokens
  company: CompanySummary | null
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  firstName: string
  lastName: string
  email: string
  password: string
}
