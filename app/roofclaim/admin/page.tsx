import { Suspense } from "react"

import { SuperAdminLoginForm } from "@/modules/auth/components/super-admin-login-form"

export default function SuperAdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SuperAdminLoginForm />
    </Suspense>
  )
}
