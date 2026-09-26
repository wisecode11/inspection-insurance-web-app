"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertCircleIcon, Loader2Icon } from "lucide-react"

import { AuthFrame } from "@/components/auth/auth-frame"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
    await submit({ email: email.trim(), password }, "company")
  }

  return (
    <AuthFrame
      title="Welcome back"
      description="Sign in to your company workspace and pick up where the crew left off."
      role="company"
      eyebrow="Secure company sign-in"
      footer={
        <p className="mt-7 text-center text-sm text-muted-foreground">
          New company admin?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:text-primary-dark hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-[13px] font-medium">
            Work email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (error) setError("")
            }}
            autoComplete="email"
            placeholder="you@company.com"
            required
            className="h-11 rounded-xl border-border/80 bg-white px-3.5 text-[15px] shadow-sm transition-[box-shadow,border-color] focus-visible:border-primary/40 focus-visible:ring-primary/20"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password" className="text-[13px] font-medium">
              Password
            </Label>
          </div>
          <PasswordField
            id="password"
            value={password}
            onChange={(next) => {
              setPassword(next)
              if (error) setError("")
            }}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="h-11 rounded-xl border-border/80 bg-white px-3.5 text-[15px] shadow-sm transition-[box-shadow,border-color] focus-visible:border-primary/40 focus-visible:ring-primary/20"
          />
        </div>
        {error && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/5 px-3 py-2.5">
            <AlertCircleIcon />
            <AlertTitle>Couldn&apos;t sign you in</AlertTitle>
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
          className="mt-1 h-11 w-full rounded-xl text-[15px] font-semibold shadow-[0_12px_28px_-12px_rgba(10,75,55,0.65)]"
          disabled={loading}
        >
          {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
          Sign in to workspace
        </Button>
        {showGoogle ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or continue with
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
