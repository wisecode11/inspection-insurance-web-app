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
import { PasswordField } from "@/modules/auth/components/password-field"
import { useSignup } from "@/modules/auth/hooks/use-signup"
import type { Role } from "@/types/role"

export function SignupForm() {
  const { error, loading, submit, setError } = useSignup()
  const [role, setRole] = React.useState<Role>("company")
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (role === "platform") return
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    await submit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
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
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  autoComplete="given-name"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  autoComplete="family-name"
                  required
                />
              </div>
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
                <AlertDescription>{error}</AlertDescription>
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
          </>
        )}
      </form>
    </AuthFrame>
  )
}
