import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/auth/constants"
import type { AuthTokens } from "@/modules/auth/types/auth.types"

function canUseStorage() {
  return typeof window !== "undefined"
}

export function saveTokens(tokens: AuthTokens) {
  if (!canUseStorage()) return
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export function getAccessToken() {
  if (!canUseStorage()) return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  if (!canUseStorage()) return null
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function clearTokens() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}
