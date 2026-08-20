import { AUTH_COOKIE, AUTH_SESSION_PATH } from "@/lib/auth/constants"
import { toPortalRole } from "@/lib/auth/portal"
import { parseRole } from "@/lib/auth/role"
import { clearTokens, getRefreshToken, saveTokens } from "@/lib/auth/token-storage"
import { clearUser, getStoredUser, saveUser } from "@/lib/auth/user-storage"
import { publicApiClient } from "@/lib/api/public-client"
import { endpoints } from "@/lib/api/endpoints"
import type { AuthPayload } from "@/modules/auth/types/auth.types"
import type { Role } from "@/types/role"

export function getSessionRole(): Role | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_COOKIE}=([^;]*)`))
  return parseRole(match?.[1])
}

export async function persistSession(payload: AuthPayload) {
  const portal = toPortalRole(payload.user.role)
  if (!portal) {
    clearTokens()
    clearUser()
    throw new Error("This account uses the inspector mobile app.")
  }

  saveTokens(payload.tokens)
  saveUser(payload.user)

  await fetch(AUTH_SESSION_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: portal }),
  })

  return portal
}

export async function destroySession() {
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) {
      await publicApiClient.post(endpoints.auth.logout, { refreshToken })
    }
  } catch {
    // Client still clears local session if the API is unreachable.
  }

  clearTokens()
  clearUser()
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`
  await fetch(AUTH_SESSION_PATH, { method: "DELETE" })
}

export { getStoredUser }
