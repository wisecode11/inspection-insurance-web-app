"use client"

import * as React from "react"
import {
  Building2Icon,
  CheckIcon,
  ChevronDownIcon,
  FileTextIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "@/lib/toast"

import { HeroBand } from "@/components/shared/list-page-hero"
import { ErrorState, LoadingSkeleton } from "@/components/shared/resource-state"
import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import { getErrorMessage } from "@/lib/api/errors"
import { useAsyncData } from "@/lib/hooks/use-async-data"
import { getStoredUser } from "@/lib/auth/user-storage"
import { cn } from "@/lib/utils"

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

type FormState = {
  name: string
  legalName: string
  email: string
  phone: string
  website: string
  line1: string
  city: string
  state: string
  postalCode: string
  country: string
}

const COUNTRIES = ["US", "CA", "GB", "AU"].map((code) => ({ value: code, label: code }))

const STATUS_PILL: Record<string, string> = {
  active: "bg-[#3DD388] text-[#06241B]",
  trial: "bg-[#F5B83D] text-[#3A2400]",
  trialing: "bg-[#F5B83D] text-[#3A2400]",
  suspended: "bg-[#F87171] text-[#450A0A]",
}

async function loadCompany() {
  const response = await apiClient.get(endpoints.companies.me)
  return unwrap<{ company: CompanyProfile }>(response.data).company
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

/** Empty fields sit on a soft grey fill; filled fields turn white; focus gets a green ring. */
const fieldClass = (filled: boolean, withIcon: boolean) =>
  cn(
    "h-12 w-full rounded-xl border text-[15px] text-[#0E1B16] outline-none transition-[border-color,box-shadow,background-color] duration-150",
    "placeholder:text-[#A6B2AC] focus:border-[#1FB86A] focus:bg-white focus:ring-4 focus:ring-[#1FB86A]/12",
    "disabled:cursor-not-allowed disabled:opacity-70",
    withIcon ? "pr-4 pl-11" : "px-4",
    filled ? "border-[#DCE4DF] bg-white" : "border-[#E9EFEB] bg-[#F7F9F8]",
  )

function Field({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  disabled,
  type = "text",
  autoComplete,
}: {
  id: string
  label: string
  icon?: LucideIcon
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  type?: string
  autoComplete?: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-[#0E1B16]">
        {label}
      </label>
      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-[#6B7A73]"
            aria-hidden
          />
        ) : null}
        <input
          id={id}
          type={type}
          value={value}
          disabled={disabled}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass(Boolean(value), Boolean(Icon))}
        />
      </div>
    </div>
  )
}

export default function OrganizationPage() {
  const user = getStoredUser()
  const canEdit = user?.role === "company_admin"
  const { data, isLoading, error, reload } = useAsyncData(loadCompany, "company-profile")
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState<FormState>({
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

  const set = (key: keyof FormState) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }))

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

  if (isLoading) return <LoadingSkeleton rows={4} />
  if (error) return <ErrorState message={error} />

  const companyName = form.name || data?.name || "Company"
  const status = (data?.status || "").toLowerCase()
  // Keep an unlisted saved country selectable.
  const countries =
    form.country && !COUNTRIES.some((c) => c.value === form.country)
      ? [{ value: form.country, label: form.country }, ...COUNTRIES]
      : COUNTRIES

  return (
    <div className="relative">
      <HeroBand className="-top-6 h-[132px]" pattern="chevron" />

      <div className="relative z-10 grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* Summary card */}
        <aside className="flex flex-col rounded-3xl border border-[#E4EBE7] bg-white p-6 shadow-[0_1px_2px_rgba(14,27,22,0.04),0_16px_36px_-22px_rgba(6,36,27,0.35)] sm:p-8 lg:sticky lg:top-0">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-[#CDE8D6] bg-[#EDF8F1] px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-[#155A45] uppercase">
            <span className="size-1.5 rounded-full bg-[#1FB86A]" />
            Company admin
          </span>
          <h1 className="mt-4 text-[clamp(32px,3.4vw,44px)] leading-[1.05] font-bold tracking-[-0.035em] text-[#0E1B16]">
            Organization
          </h1>
          <p className="mt-3 text-[15px] leading-[1.65] text-[#5B6B64]">
            View and update your company profile used across jobs, reports, and branding.
          </p>

          <div
            className="relative mt-8 overflow-hidden rounded-2xl p-5 text-white shadow-[0_16px_30px_-18px_rgba(6,36,27,0.7)]"
            style={{ background: "linear-gradient(135deg, #0E4434 0%, #0A3326 55%, #145C44 100%)" }}
          >
            {/* decorative roof lines */}
            <svg
              aria-hidden
              viewBox="0 0 200 120"
              className="pointer-events-none absolute right-0 bottom-0 h-28 w-48 text-white/10"
            >
              <path d="M10 120 100 40l90 80M40 120l60-54 60 54M70 120l30-27 30 27" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="relative grid size-14 place-items-center rounded-xl border border-white/15 bg-white/12 text-lg font-bold tracking-tight">
              {initialsOf(companyName)}
            </span>
            <p className="relative mt-4 truncate text-xl font-bold tracking-[-0.02em]" title={companyName}>
              {companyName}
            </p>
            <span
              className={cn(
                "relative mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold",
                STATUS_PILL[status] ?? "bg-white/15 text-white",
              )}
            >
              <i className="size-1.5 rounded-full bg-current opacity-70" />
              Status: {data?.status || "—"}
            </span>
          </div>

          {canEdit ? (
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0A3326] text-[15px] font-semibold text-white shadow-[0_10px_22px_-12px_rgba(6,36,27,0.8)] transition-[transform,background-color] duration-150 hover:bg-[#0E4434] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <CheckIcon className="size-[18px]" />
              {saving ? "Saving…" : "Save changes"}
            </button>
          ) : (
            <p className="mt-5 text-center text-[13px] text-[#6B7A73]">
              Only company admins can edit these details.
            </p>
          )}
        </aside>

        {/* Form card */}
        <section
          aria-label="Company profile"
          className="rounded-3xl border border-[#E4EBE7] bg-white p-6 shadow-[0_1px_2px_rgba(14,27,22,0.04),0_16px_36px_-22px_rgba(6,36,27,0.35)] sm:p-8 lg:p-10"
        >
          <form
            className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault()
              void save()
            }}
          >
            <div className="xl:col-span-2">
              <Field id="org-name" label="Company name" icon={Building2Icon} value={form.name} onChange={set("name")} disabled={!canEdit} autoComplete="organization" />
            </div>
            <div className="xl:col-span-2">
              <Field id="org-legal" label="Legal name" icon={FileTextIcon} value={form.legalName} onChange={set("legalName")} disabled={!canEdit} />
            </div>
            <div className="xl:col-span-2">
              <Field id="org-email" label="Contact email" icon={MailIcon} type="email" value={form.email} onChange={set("email")} disabled={!canEdit} autoComplete="email" />
            </div>
            <div className="xl:col-span-2">
              <Field id="org-phone" label="Phone" icon={PhoneIcon} type="tel" value={form.phone} onChange={set("phone")} disabled={!canEdit} autoComplete="tel" />
            </div>
            <div className="xl:col-span-2">
              <Field id="org-website" label="Website" icon={GlobeIcon} type="url" value={form.website} onChange={set("website")} disabled={!canEdit} autoComplete="url" />
            </div>
            <div className="xl:col-span-2">
              <Field id="org-line1" label="Street address" icon={MapPinIcon} value={form.line1} onChange={set("line1")} disabled={!canEdit} autoComplete="street-address" />
            </div>
            <Field id="org-city" label="City" value={form.city} onChange={set("city")} disabled={!canEdit} autoComplete="address-level2" />
            <Field id="org-state" label="State" value={form.state} onChange={set("state")} disabled={!canEdit} autoComplete="address-level1" />
            <Field id="org-postal" label="Postal code" value={form.postalCode} onChange={set("postalCode")} disabled={!canEdit} autoComplete="postal-code" />
            <div className="flex min-w-0 flex-col gap-2">
              <label htmlFor="org-country" className="text-sm font-semibold text-[#0E1B16]">
                Country
              </label>
              <div className="relative">
                <select
                  id="org-country"
                  value={form.country}
                  disabled={!canEdit}
                  onChange={(e) => set("country")(e.target.value)}
                  className={cn(fieldClass(Boolean(form.country), false), "cursor-pointer appearance-none pr-10")}
                >
                  <option value="">Select…</option>
                  {countries.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-[#6B7A73]" />
              </div>
            </div>
            {/* lets Enter submit the form */}
            <button type="submit" hidden aria-hidden tabIndex={-1} />
          </form>
        </section>
      </div>
    </div>
  )
}
