"use client"

import * as React from "react"

import { getErrorMessage } from "@/lib/api/errors"
import { persistSession } from "@/lib/auth/session"
import { pathAfterLogin } from "@/lib/auth/next-path"
import { authService } from "@/modules/auth/services/auth.service"
import type { LoginInput } from "@/modules/auth/types/auth.types"
import type { Role } from "@/types/role"

export function useLogin() {
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function submit(input: LoginInput, role: Role) {
    setError("")
    setLoading(true)
    try {
      const payload = await authService.login(input)
      await persistSession(payload)
      window.location.assign(pathAfterLogin(payload.user, role))
    } catch (caught) {
      setError(getErrorMessage(caught))
      setLoading(false)
    }
  }

  return { error, loading, submit, setError }
}
