import type { ReactNode } from "react"

import { AuthExperience } from "@/modules/auth/components/auth-experience"

/**
 * Shared shell for /login and /signup. Kept in a layout so it persists
 * across the two routes and can animate the swap between them; the
 * pages themselves only contribute metadata.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthExperience />
      {children}
    </>
  )
}
