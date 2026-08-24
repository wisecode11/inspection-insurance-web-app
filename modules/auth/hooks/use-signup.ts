"use client"

import * as React from "react"

import { getErrorMessage } from "@/lib/api/errors"
import { persistSession } from "@/lib/auth/session"
import { pathAfterSignup } from "@/lib/auth/next-path"
import { authService } from "@/modules/auth/services/auth.service"
import type { RegisterInput } from "@/modules/auth/types/auth.types"

export function useSignup() {
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function submit(input: RegisterInput) {
    setError("")
    setLoading(true)
    try {
      const payload = await authService.register(input)
      await persistSession(payload)
      window.location.assign(pathAfterSignup())
    } catch (caught) {
      setError(getErrorMessage(caught))
      setLoading(false)
    }
  }

  async function submitGoogle(idToken: string) {
    setError("")
    setLoading(true)
    try {
      const payload = await authService.google({ idToken, mode: "signup" })
      await persistSession(payload)
      window.location.assign(pathAfterSignup())
    } catch (caught) {
      setError(getErrorMessage(caught))
      setLoading(false)
    }
  }

  return { error, loading, submit, submitGoogle, setError }
}
