import { LoginForm } from "@/modules/auth/components/login-form"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  )
}
