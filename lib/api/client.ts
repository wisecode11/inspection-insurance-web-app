import axios from "axios"

import { env } from "@/lib/config/env"
import { ApiError, normalizeApiError } from "@/lib/api/errors"
import { markRetry, refreshAccessToken, wasRetried } from "@/lib/api/refresh"
import { getAccessToken } from "@/lib/auth/token-storage"

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const normalized = normalizeApiError(error)
    const original = axios.isAxiosError(error) ? error.config : undefined

    if (normalized instanceof ApiError && normalized.status === 401 && original && !wasRetried(original)) {
      const nextToken = await refreshAccessToken()
      if (nextToken) {
        const retryConfig = markRetry(original)
        retryConfig.headers.Authorization = `Bearer ${nextToken}`
        return apiClient(retryConfig)
      }

      if (typeof window !== "undefined") {
        const path = window.location.pathname
        if (!path.startsWith("/login") && !path.startsWith("/signup")) {
          const { destroySession } = await import("@/lib/auth/session")
          await destroySession()
          window.location.assign("/login")
        }
      }
    }

    return Promise.reject(normalized)
  },
)
