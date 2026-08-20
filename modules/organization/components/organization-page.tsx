"use client"

import * as React from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import { getErrorMessage } from "@/lib/api/errors"
import { useAsyncData } from "@/lib/hooks/use-async-data"
import { getStoredUser } from "@/lib/auth/user-storage"

type CompanyProfile = {
  id: string
  name: string
  legalName: string
  status: string
  contact: {
    email: string
    phone: string
    website: string
    address: {
      line1: string
      line2: string
      city: string
      state: string
      postalCode: string
      country: string
    }
  }
}

async function loadCompany() {
  const response = await apiClient.get(endpoints.companies.me)
  return unwrap<{ company: CompanyProfile }>(response.data).company
}

export default function OrganizationPage() {
  const user = getStoredUser()
  const canEdit = user?.role === "company_admin"
  const { data, isLoading, error, reload } = useAsyncData(loadCompany, "company-profile")
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "",
    legalName: "",
    email: "",
    phone: "",
    website: "",
    line1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  })

  React.useEffect(() => {
    if (!data) return
    setForm({
      name: data.name || "",
      legalName: data.legalName || "",
      email: data.contact?.email || "",
      phone: data.contact?.phone || "",
      website: data.contact?.website || "",
      line1: data.contact?.address?.line1 || "",
      city: data.contact?.address?.city || "",
      state: data.contact?.address?.state || "",
      postalCode: data.contact?.address?.postalCode || "",
      country: data.contact?.address?.country || "",
    })
  }, [data])

  async function save() {
    if (!canEdit) return
    setSaving(true)
    try {
      await apiClient.patch(endpoints.companies.update, {
        name: form.name,
        legalName: form.legalName,
        contact: {
          email: form.email,
          phone: form.phone,
          website: form.website,
          address: {
            line1: form.line1,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
        },
      })
      toast.success("Organization updated")
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <LoadingState label="Loading organization…" />
  if (error) return <ErrorState message={error} />

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Organization"
        description="View and update your company profile used across jobs, reports, and branding."
        actions={
          canEdit ? (
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          ) : null
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{data?.name || "Company"}</CardTitle>
          <CardDescription>Status: {data?.status || "—"}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Company name</Label>
            <Input
              value={form.name}
              disabled={!canEdit}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Legal name</Label>
            <Input
              value={form.legalName}
              disabled={!canEdit}
              onChange={(e) => setForm((prev) => ({ ...prev, legalName: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Contact email</Label>
            <Input
              value={form.email}
              disabled={!canEdit}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              disabled={!canEdit}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Website</Label>
            <Input
              value={form.website}
              disabled={!canEdit}
              onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Street address</Label>
            <Input
              value={form.line1}
              disabled={!canEdit}
              onChange={(e) => setForm((prev) => ({ ...prev, line1: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>City</Label>
            <Input
              value={form.city}
              disabled={!canEdit}
              onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>State</Label>
            <Input
              value={form.state}
              disabled={!canEdit}
              onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Postal code</Label>
            <Input
              value={form.postalCode}
              disabled={!canEdit}
              onChange={(e) => setForm((prev) => ({ ...prev, postalCode: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Country</Label>
            <Input
              value={form.country}
              disabled={!canEdit}
              onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
