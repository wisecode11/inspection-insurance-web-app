"use client"

import * as React from "react"
import { ImageIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { StormBadge } from "@/components/shared/storm-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBranding } from "@/modules/branding/hooks/use-branding"
import { brandingService } from "@/modules/branding/services/branding.service"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"

export default function BrandingPage() {
  const { data, isLoading, error } = useBranding()
  const [company, setCompany] = React.useState(data?.company ?? "")
  const [address, setAddress] = React.useState(data?.address ?? "")
  const [license, setLicense] = React.useState(data?.license ?? "")
  const [primary, setPrimary] = React.useState(data?.primary ?? "#0F4C81")
  const [accent, setAccent] = React.useState(data?.accent ?? "#F59E0B")
  const [logoName, setLogoName] = React.useState<string | null>(data?.logoName ?? null)

  React.useEffect(() => {
    if (!data) return
    setCompany(data.company)
    setAddress(data.address)
    setLicense(data.license)
    setPrimary(data.primary)
    setAccent(data.accent)
    setLogoName(data.logoName)
  }, [data])

  if (isLoading) return <LoadingState label="Loading branding…" />
  if (error) return <ErrorState message={error} />

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Branding"
        description="Logo, colors, and company details as they appear on exported reports."
        actions={
          <Button
            className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
            onClick={async () => {
              await brandingService.save({ company, address, license, primary, accent, logoName })
              toast.success("Branding saved")
            }}
          >
            Save branding
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>Used in the report header. PNG or SVG, 400×120 recommended.</CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center hover:bg-muted/40">
                <ImageIcon className="size-8 text-muted-foreground" />
                <span className="text-sm font-medium">{logoName ?? "Upload company logo"}</span>
                <span className="text-xs text-muted-foreground">Click to choose a file</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => setLogoName(e.target.files?.[0]?.name ?? null)}
                />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand colors</CardTitle>
              <CardDescription>Primary for headers and links. Accent for damage highlights.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ColorField label="Primary" value={primary} onChange={setPrimary} />
              <ColorField label="Accent" value={accent} onChange={setAccent} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company details</CardTitle>
              <CardDescription>Printed on every evidence report cover.</CardDescription>
            </CardHeader>
            <CardContent className="flex max-w-xl flex-col gap-4">
              <Field label="Company name" value={company} onChange={setCompany} />
              <Field label="Address" value={address} onChange={setAddress} />
              <Field label="License number" value={license} onChange={setLicense} />
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>Live preview</CardTitle>
            <CardDescription>Report header as the carrier will see it</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border bg-background">
              <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ backgroundColor: primary }}>
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex size-8 items-center justify-center rounded-md text-xs font-semibold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {company.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="flex min-w-0 flex-col text-white">
                    <span className="truncate text-sm font-semibold">{company}</span>
                    <span className="truncate text-[11px] opacity-80">Insurance evidence report</span>
                  </div>
                </div>
                <StormBadge state="verified" size="sm" />
              </div>
              <div className="flex flex-col gap-1 px-4 py-4 text-sm">
                <p className="font-medium">482 Maple Crest Dr, Denver, CO</p>
                <p className="text-xs text-muted-foreground">{address}</p>
                <p className="text-xs text-muted-foreground">License {license}</p>
                {logoName && (
                  <p className="mt-2 text-xs text-muted-foreground">Logo file: {logoName}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-")
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 cursor-pointer rounded-md border bg-transparent p-1"
          aria-label={label}
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono uppercase" />
      </div>
    </div>
  )
}
