"use client"

import * as React from "react"
import { ImageIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useBranding } from "@/modules/branding/hooks/use-branding"
import { brandingService } from "@/modules/branding/services/branding.service"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { getErrorMessage } from "@/lib/api/errors"

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("Could not read logo file"))
    reader.readAsDataURL(file)
  })
}

export default function BrandingPage() {
  const { data, isLoading, error, reload } = useBranding()
  const [companyDisplayName, setCompanyDisplayName] = React.useState("")
  const [footerText, setFooterText] = React.useState("")
  const [tagline, setTagline] = React.useState("")
  const [primary, setPrimary] = React.useState("#1B4F72")
  const [accent, setAccent] = React.useState("#E07A3D")
  const [logoUrl, setLogoUrl] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [website, setWebsite] = React.useState("")
  const [addressLine, setAddressLine] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!data) return
    setCompanyDisplayName(data.companyDisplayName)
    setFooterText(data.footerText)
    setTagline(data.tagline)
    setPrimary(data.primaryColor)
    setAccent(data.accentColor)
    setLogoUrl(data.logoUrl)
    setEmail(data.contact.email)
    setPhone(data.contact.phone)
    setWebsite(data.contact.website)
    setAddressLine(data.contact.addressLine)
  }, [data])

  async function onLogoChange(file?: File | null) {
    if (!file) return
    if (file.size > 1_500_000) {
      toast.error("Logo must be under 1.5MB")
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setLogoUrl(dataUrl)
      toast.success("Logo ready — save branding to apply")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function save() {
    setSaving(true)
    try {
      await brandingService.save({
        companyDisplayName: companyDisplayName.trim(),
        footerText: footerText.trim(),
        primaryColor: primary,
        accentColor: accent,
        tagline: tagline.trim(),
        logoUrl,
        contact: {
          email: email.trim(),
          phone: phone.trim(),
          website: website.trim(),
        },
      })
      toast.success("Branding saved — applied to PDF reports and customer emails")
      await reload?.()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <LoadingState label="Loading branding…" />
  if (error) return <ErrorState message={error} />

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Branding"
        description="Logo, company name, footer text, and contact details applied automatically to PDF reports, customer report emails, and email templates."
        actions={
          <Button
            className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
            disabled={saving}
            onClick={save}
          >
            {saving ? "Saving…" : "Save branding"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload logo</CardTitle>
              <CardDescription>Used in report headers and branded emails. PNG/JPG/SVG, under 1.5MB.</CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center hover:bg-muted/40">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Company logo" className="max-h-16 max-w-full object-contain" />
                ) : (
                  <ImageIcon className="size-8 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">{logoUrl ? "Replace logo" : "Upload company logo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => onLogoChange(e.target.files?.[0])}
                />
              </label>
              {logoUrl ? (
                <Button variant="ghost" className="mt-2" onClick={() => setLogoUrl("")}>
                  Remove logo
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company name</CardTitle>
              <CardDescription>Display name on PDFs and customer-facing emails.</CardDescription>
            </CardHeader>
            <CardContent className="flex max-w-xl flex-col gap-4">
              <Field label="Company display name" value={companyDisplayName} onChange={setCompanyDisplayName} />
              <Field label="Tagline" value={tagline} onChange={setTagline} />
              <div className="grid gap-4 sm:grid-cols-2">
                <ColorField label="Primary" value={primary} onChange={setPrimary} />
                <ColorField label="Accent" value={accent} onChange={setAccent} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Footer text</CardTitle>
              <CardDescription>Printed at the bottom of PDF reports and customer emails.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                rows={3}
                placeholder="Licensed roofing contractor · Confidential claim documentation"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact information</CardTitle>
              <CardDescription>Shown on reports and share emails. Address is managed under Organization.</CardDescription>
            </CardHeader>
            <CardContent className="grid max-w-xl gap-4 sm:grid-cols-2">
              <Field label="Email" value={email} onChange={setEmail} />
              <Field label="Phone" value={phone} onChange={setPhone} />
              <Field label="Website" value={website} onChange={setWebsite} />
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>Address (from Organization)</Label>
                <Input value={addressLine} disabled />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>Live preview</CardTitle>
            <CardDescription>How branding appears on customer reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border bg-background">
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ backgroundColor: primary }}
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="" className="h-8 max-w-[120px] object-contain" />
                ) : (
                  <span
                    className="flex size-8 items-center justify-center rounded-md text-xs font-semibold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {(companyDisplayName || "CO").slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="flex min-w-0 flex-col text-white">
                  <span className="truncate text-sm font-semibold">{companyDisplayName || "Company"}</span>
                  <span className="truncate text-[11px] opacity-80">
                    {tagline || "Insurance evidence report"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 px-4 py-4 text-sm">
                <p className="font-medium">Sample customer report</p>
                <p className="text-xs text-muted-foreground">
                  {[phone, email, website].filter(Boolean).join(" · ") || "Add contact details"}
                </p>
                {addressLine ? (
                  <p className="text-xs text-muted-foreground">{addressLine}</p>
                ) : null}
                <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
                  {footerText || "Footer text appears here on PDF & email"}
                </p>
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
