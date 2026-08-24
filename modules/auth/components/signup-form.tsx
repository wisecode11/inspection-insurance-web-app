"use client"

import * as React from "react"
import Link from "next/link"
import { Loader2Icon } from "lucide-react"

import { AuthFrame } from "@/components/auth/auth-frame"
import { RoleCards } from "@/components/auth/role-cards"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { env } from "@/lib/config/env"
import { GoogleSignInButton } from "@/modules/auth/components/google-sign-in-button"
import { PasswordField } from "@/modules/auth/components/password-field"
import { useSignup } from "@/modules/auth/hooks/use-signup"
import type { Role } from "@/types/role"

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: "", lastName: "" }
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] }
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  }
}

export function SignupForm() {
  const { error, loading, submit, submitGoogle, setError } = useSignup()
  const [role, setRole] = React.useState<Role>("company")
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const showGoogle = role === "company" && Boolean(env.googleClientId)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (role === "platform") return
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    const { firstName, lastName } = splitFullName(fullName)
    if (!firstName) {
      setError("Full name is required.")
      return
    }
    await submit({
      firstName,
      lastName,
      email: email.trim(),
      password,
    })
  }

  return (
    <AuthFrame
      title={role === "platform" ? "Platform owner access" : "Create your company account"}
      description={
        role === "platform"
          ? "Platform owner accounts are provisioned by RoofClaim. Sign in with your credentials."
          : "Then create your organization and choose a plan."
      }
      role={role}
      footer={
        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-terracotta hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Sign up as</Label>
          <RoleCards value={role} onChange={setRole} />
        </div>

        {role === "platform" ? (
          <Button
            type="button"
            className="h-10 w-full bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
            onClick={() => window.location.assign("/login?role=platform")}
          >
            Go to platform sign in
          </Button>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                placeholder="Jordan Blake"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
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
                autoComplete="new-password"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                  {/already registered|already exists|409/i.test(error) ? (
                    <>
                      {" "}
                      <Link href="/login" className="font-medium underline">
                        Sign in
                      </Link>
                    </>
                  ) : null}
                </AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
            >
              {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
              Create account
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
                  onCredential={submitGoogle}
                  onError={setError}
                />
              </div>
            ) : null}
          </>
        )}
      </form>
    </AuthFrame>
  )
}
