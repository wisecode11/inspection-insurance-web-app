"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { AuthFrame } from "@/components/auth/auth-frame"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordField } from "@/modules/auth/components/password-field"
import { useLogin } from "@/modules/auth/hooks/use-login"

export function SuperAdminLoginForm() {
  const { error, loading, submit } = useLogin()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    await submit({ email: email.trim(), password }, "platform")
  }

  return (
    <AuthFrame
      title="Super Admin"
      description="Sign in to manage users and subscriptions across RoofClaim."
      role="platform"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordField
            id="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button
          type="submit"
          className="h-10 w-full"
          disabled={loading}
        >
          {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
          Sign in
        </Button>
      </form>
    </AuthFrame>
  )
}
