import { apiClient } from "@/lib/api/client"
import { unwrap } from "@/lib/api/unwrap"
import { env } from "@/lib/config/env"

export async function apiGet<T>(path: string, mock: () => T | Promise<T>): Promise<T> {
  if (env.useMocks) return mock()
  const response = await apiClient.get(path)
  return unwrap<T>(response.data)
}

export async function apiPost<T, B>(path: string, body: B, mock: (body: B) => T | Promise<T>): Promise<T> {
  if (env.useMocks) return mock(body)
  const response = await apiClient.post(path, body)
  return unwrap<T>(response.data)
}

export async function apiPatch<T, B>(path: string, body: B, mock: (body: B) => T | Promise<T>): Promise<T> {
  if (env.useMocks) return mock(body)
  const response = await apiClient.patch(path, body)
  return unwrap<T>(response.data)
}

export async function apiDelete<T>(path: string, mock: () => T | Promise<T>): Promise<T> {
  if (env.useMocks) return mock()
  const response = await apiClient.delete(path)
  return unwrap<T>(response.data)
}
