import { AUTH_USER_KEY } from "@/lib/auth/constants"
import type { AuthUser } from "@/types/user"

function canUseStorage() {
  return typeof window !== "undefined"
}

export function saveUser(user: AuthUser) {
  if (!canUseStorage()) return
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function getStoredUser(): AuthUser | null {
  if (!canUseStorage()) return null
  const raw = window.localStorage.getItem(AUTH_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function clearUser() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(AUTH_USER_KEY)
}
