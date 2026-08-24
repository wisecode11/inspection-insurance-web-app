"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { AuthFrame } from "@/components/auth/auth-frame"
import { RoleCards } from "@/components/auth/role-cards"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parseRole } from "@/lib/auth/role"
import { env } from "@/lib/config/env"
import { GoogleSignInButton } from "@/modules/auth/components/google-sign-in-button"
import { PasswordField } from "@/modules/auth/components/password-field"
import { useLogin } from "@/modules/auth/hooks/use-login"
import type { Role } from "@/types/role"

export function LoginForm() {
  const searchParams = useSearchParams()
  const { error, loading, submit, submitGoogle, setError } = useLogin()
  const [role, setRole] = React.useState<Role>(parseRole(searchParams.get("role")) ?? "company")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const showGoogle = role === "company" && Boolean(env.googleClientId)

  React.useEffect(() => {
    setRole(parseRole(searchParams.get("role")) ?? "company")
  }, [searchParams])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    await submit({ email: email.trim(), password }, role)
  }

  return (
    <AuthFrame
      title="Welcome back"
      description="Choose Company or Platform owner, then sign in."
      role={role}
      footer={
        <p className="mt-6 text-sm text-muted-foreground">
          New company admin?{" "}
          <Link href="/signup" className="font-medium text-terracotta hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Continue as</Label>
          <RoleCards value={role} onChange={setRole} />
        </div>
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
            <AlertDescription>
              {error}
              {/no account found|create an account/i.test(error) ? (
                <>
                  {" "}
                  <Link href="/signup" className="font-medium underline">
                    Sign up
                  </Link>
                </>
              ) : null}
            </AlertDescription>
          </Alert>
        )}
        <Button
          type="submit"
          className="h-10 w-full bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
          disabled={loading}
        >
          {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
          Sign in
        </Button>
        {showGoogle ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
            <GoogleSignInButton
              disabled={loading}
              onCredential={(idToken) => submitGoogle(idToken, role)}
              onError={setError}
            />
          </div>
        ) : null}
      </form>
    </AuthFrame>
  )
}
