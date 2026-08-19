"use client"

import * as React from "react"
import { Building2Icon, Loader2Icon } from "lucide-react"

import { AuthFrame } from "@/components/auth/auth-frame"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/api/errors"
import { pathAfterSelect } from "@/lib/auth/next-path"
import { saveActiveCompany } from "@/lib/auth/workspace-storage"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"
import { organizationService } from "@/modules/onboarding/services/organization.service"
import type { CompanySummary } from "@/types/company"

export function OrganizationSelect() {
  const [companies, setCompanies] = React.useState<CompanySummary[]>([])
  const [selectedId, setSelectedId] = React.useState<string>("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [continuing, setContinuing] = React.useState(false)

  React.useEffect(() => {
    organizationService
      .list()
      .then(({ companies: rows }) => {
        setCompanies(rows)
        setSelectedId(rows[0]?.id ?? "")
      })
      .catch((caught) => setError(getErrorMessage(caught)))
      .finally(() => setLoading(false))
  }, [])

  function continueWith(company: CompanySummary | null) {
    setContinuing(true)
    if (company) saveActiveCompany(company)
    window.location.assign(pathAfterSelect(company))
  }

  return (
    <AuthFrame
      title="Select organization"
      description="Choose the company workspace to open."
      role="company"
    >
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          Loading organizations…
        </div>
      ) : companies.length === 0 ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            No organization yet. Create one to continue.
          </p>
          <Button
            className="h-10 w-full bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
            onClick={() => window.location.assign(ROUTES.onboarding.organization)}
          >
            Create organization
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {companies.map((company) => {
              const selected = company.id === selectedId
              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => setSelectedId(company.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-terracotta bg-terracotta/10 ring-1 ring-terracotta/30"
                      : "border-border hover:border-terracotta/40",
                  )}
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-terracotta text-terracotta-foreground">
                    <Building2Icon className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="font-medium">{company.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {company.status.replaceAll("_", " ")}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            className="h-10 w-full bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
            disabled={!selectedId || continuing}
            onClick={() => continueWith(companies.find((row) => row.id === selectedId) ?? null)}
          >
            {continuing && <Loader2Icon data-icon="inline-start" className="animate-spin" />}
            Continue
          </Button>
        </div>
      )}
    </AuthFrame>
  )
}
