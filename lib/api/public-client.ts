import axios from "axios"

import { normalizeApiError } from "@/lib/api/errors"
import { env } from "@/lib/config/env"

export const publicApiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
})

// Same error shape as apiClient, so callers always get an ApiError with the server's message.
publicApiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error)),
)
