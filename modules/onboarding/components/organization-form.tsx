"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { AuthFrame } from "@/components/auth/auth-frame"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getErrorMessage } from "@/lib/api/errors"
import { persistSession } from "@/lib/auth/session"
import { pathAfterOrganization, pathForCompany } from "@/lib/auth/next-path"
import { ROUTES } from "@/lib/constants/routes"
import { authService } from "@/modules/auth/services/auth.service"
import { OnboardingSteps } from "@/modules/onboarding/components/onboarding-steps"
import { organizationService } from "@/modules/onboarding/services/organization.service"

export function OrganizationForm() {
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    authService
      .me()
      .then(({ company, user }) => {
        if (company) {
          window.location.replace(pathForCompany(company))
          return
        }
        // Org already linked on the user — never show create-organization again.
        if (user?.companyId) {
          window.location.replace(ROUTES.company.dashboard)
        }
      })
      .catch(() => undefined)
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const payload = await organizationService.create({ name: name.trim() })
      await persistSession(payload)
      window.location.assign(pathAfterOrganization())
    } catch (caught) {
      setError(getErrorMessage(caught))
      setLoading(false)
    }
  }

  return (
    <AuthFrame
      title="Create your organization"
      description="Enter your company name. You can add address and contact details later under Organization."
      role="company"
    >
      <OnboardingSteps current="organization" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Organization name</Label>
          <Input
            id="name"
            placeholder="Summit Ridge Roofing"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
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
          className="h-10 w-full"
        >
          {loading && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
          Continue to plans
        </Button>
      </form>
    </AuthFrame>
  )
}
