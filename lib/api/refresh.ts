import type { InternalAxiosRequestConfig } from "axios"

import { publicApiClient } from "@/lib/api/public-client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import { saveTokens, getRefreshToken, clearTokens } from "@/lib/auth/token-storage"
import type { AuthTokens } from "@/modules/auth/types/auth.types"

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<string | null> | null = null

async function requestNewAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  const response = await publicApiClient.post(endpoints.auth.refresh, {
    refreshToken,
    platform: "web",
  })
  const data = unwrap<{ tokens: AuthTokens }>(response.data)
  saveTokens(data.tokens)
  return data.tokens.accessToken
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken()
      .catch(() => {
        clearTokens()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export function markRetry(config: InternalAxiosRequestConfig): RetryConfig {
  const retryConfig = config as RetryConfig
  retryConfig._retry = true
  return retryConfig
}

export function wasRetried(config?: InternalAxiosRequestConfig) {
  return Boolean((config as RetryConfig | undefined)?._retry)
}
