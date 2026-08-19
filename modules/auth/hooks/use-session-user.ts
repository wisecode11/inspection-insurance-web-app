"use client"

import * as React from "react"

import { getStoredUser } from "@/lib/auth/user-storage"
import type { AuthUser } from "@/types/user"

export function useSessionUser() {
  const [user, setUser] = React.useState<AuthUser | null>(null)

  React.useEffect(() => {
    setUser(getStoredUser())
  }, [])

  return user
}
