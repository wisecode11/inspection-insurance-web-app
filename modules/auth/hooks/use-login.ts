"use client"

import * as React from "react"

import { ApiError, getErrorMessage } from "@/lib/api/errors"
import { persistSession } from "@/lib/auth/session"
import { pathAfterLogin } from "@/lib/auth/next-path"
import { authService } from "@/modules/auth/services/auth.service"
import type { LoginInput } from "@/modules/auth/types/auth.types"
import type { Role } from "@/types/role"

/** Turns a failed sign-in into a message a user can act on. */
function loginErrorMessage(error: unknown) {
  const status = error instanceof ApiError ? error.status : undefined
  const message = getErrorMessage(error)

  if (status === 401) return "Incorrect email or password. Please check your details and try again."
  if (status === 403) {
    return /not active/i.test(message)
      ? "Your account is not active. Please contact your company admin or support."
      : message
  }
  if (status === 429) return "Too many sign-in attempts. Please wait a moment and try again."
  // The server rejects short passwords before checking them; to the user that's just a wrong password.
  if (status === 400 && /password/i.test(message)) {
    return "Incorrect email or password. Please check your details and try again."
  }
  return message
}

export function useLogin() {
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function submit(input: LoginInput, role: Role) {
    setError("")
    setLoading(true)
    try {
      const payload = await authService.login(input)
      await persistSession(payload)
      window.location.assign(pathAfterLogin(payload.user, role, payload.company))
    } catch (caught) {
      setError(loginErrorMessage(caught))
      setLoading(false)
    }
  }

  async function submitGoogle(idToken: string, role: Role) {
    if (role !== "company") {
      setError("Google sign-in is only available for company admins.")
      return
    }
    setError("")
    setLoading(true)
    try {
      const payload = await authService.google({ idToken, mode: "login" })
      await persistSession(payload)
      window.location.assign(pathAfterLogin(payload.user, role, payload.company))
    } catch (caught) {
      // Google 401s mean a mismatched/invalid Google account, not a wrong password.
      setError(getErrorMessage(caught))
      setLoading(false)
    }
  }

  return { error, loading, submit, submitGoogle, setError }
}
