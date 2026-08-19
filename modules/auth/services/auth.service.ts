import { apiClient } from "@/lib/api/client"
import { publicApiClient } from "@/lib/api/public-client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import type { AuthPayload, LoginInput, RegisterInput } from "@/modules/auth/types/auth.types"
import type { AuthUser } from "@/types/user"

export const authService = {
  async register(input: RegisterInput) {
    const response = await publicApiClient.post(endpoints.auth.register, {
      ...input,
    })
    return unwrap<AuthPayload>(response.data)
  },

  async login(input: LoginInput) {
    const response = await publicApiClient.post(endpoints.auth.login, {
      ...input,
      platform: "web",
    })
    return unwrap<AuthPayload>(response.data)
  },

  async me() {
    const response = await apiClient.get(endpoints.auth.me)
    return unwrap<{ user: AuthUser; company: AuthPayload["company"] }>(response.data)
  },

  async logout(refreshToken?: string | null) {
    await publicApiClient.post(endpoints.auth.logout, { refreshToken: refreshToken || "" })
  },
}
