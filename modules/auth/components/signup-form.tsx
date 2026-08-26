"use client"

import * as React from "react"
import Link from "next/link"
import { Loader2Icon } from "lucide-react"

import { AuthFrame } from "@/components/auth/auth-frame"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { env } from "@/lib/config/env"
import { GoogleSignInButton } from "@/modules/auth/components/google-sign-in-button"
import { PasswordField } from "@/modules/auth/components/password-field"
import { useSignup } from "@/modules/auth/hooks/use-signup"

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
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  const showGoogle = Boolean(env.googleClientId)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
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
      title="Create your company account"
      description="Then create your organization and choose a plan."
      role="company"
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
      </form>
    </AuthFrame>
  )
}
