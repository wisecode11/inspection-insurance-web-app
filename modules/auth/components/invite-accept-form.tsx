"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { AuthFrame } from "@/components/auth/auth-frame"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/api/errors"
import { env } from "@/lib/config/env"
import { GoogleSignInButton } from "@/modules/auth/components/google-sign-in-button"
import { PasswordField } from "@/modules/auth/components/password-field"
import { inviteService, type InvitePreview } from "@/modules/auth/services/invite.service"

export function InviteAcceptForm() {
  const params = useParams<{ token: string }>()
  const token = params.token

  const [preview, setPreview] = React.useState<InvitePreview | null>(null)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [accepted, setAccepted] = React.useState(false)
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [password, setPassword] = React.useState("")

  React.useEffect(() => {
    let cancelled = false
    inviteService
      .preview(token)
      .then((data) => {
        if (cancelled) return
        setPreview(data)
        setFirstName(data.firstName)
        setLastName(data.lastName)
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(getErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [token])

  async function handlePassword(event: React.FormEvent) {
    event.preventDefault()
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      await inviteService.accept(token, {
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })
      setAccepted(true)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle(idToken: string) {
    setLoading(true)
    setError(null)
    try {
      await inviteService.acceptGoogle(token, idToken)
      setAccepted(true)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (loadError) {
    return (
      <AuthFrame title="Invite unavailable" description={loadError} role="company">
        <p className="text-sm text-muted-foreground">Ask your company admin to send a new invite.</p>
      </AuthFrame>
    )
  }

  if (!preview) {
    return (
      <AuthFrame title="Loading invite" description="Checking your invitation." role="company">
        <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
      </AuthFrame>
    )
  }

  if (accepted) {
    return (
      <AuthFrame
        title="You're in"
        description={`${preview.companyName} added you as a field inspector.`}
        role="company"
      >
        <p className="text-sm text-muted-foreground">
          Open the RoofClaim inspector app on your phone and sign in with {preview.email}. This web workspace is for
          company admins only.
        </p>
      </AuthFrame>
    )
  }

  const showGoogle = Boolean(env.googleClientId) && preview.googleEnabled

  return (
    <AuthFrame
      title="Join the inspection team"
      description={`${preview.companyName} invited ${preview.email}. Set a password or continue with Google, then use the mobile app.`}
      role="company"
    >
      <form onSubmit={handlePassword} className="flex flex-col gap-4">
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
          <Label htmlFor="password">Create password</Label>
          <PasswordField id="password" value={password} onChange={setPassword} autoComplete="new-password" />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="h-10 w-full"
        >
          {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
          Set password and join
        </Button>
      </form>
      {showGoogle ? (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <GoogleSignInButton disabled={loading} onCredential={handleGoogle} />
          <p className="text-xs text-muted-foreground">Use the same Google account as {preview.email}.</p>
        </div>
      ) : null}
    </AuthFrame>
  )
}
