"use client"

import * as React from "react"
import {
  ArrowRightIcon,
  CalendarIcon,
  CreditCardIcon,
  DownloadIcon,
  FileTextIcon,
  PencilIcon,
  RefreshCwIcon,
  TimerIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "@/lib/toast"

import { ErrorState, LoadingSkeleton } from "@/components/shared/resource-state"
import { getErrorMessage } from "@/lib/api/errors"
import { cn } from "@/lib/utils"
import { billingService } from "@/modules/billing/services/billing.service"
import type { BillingInvoice, BillingOverview } from "@/modules/billing/types/billing.types"

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString()
}

function invoiceDownloadUrl(invoice: BillingInvoice) {
  return invoice.pdfUrl || invoice.hostedInvoiceUrl || ""
}

/** Share of the billing period already elapsed, 0–100. */
function periodProgress(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end) return 0
  const from = new Date(start).getTime()
  const to = new Date(end).getTime()
  if (!(to > from)) return 0
  return Math.min(100, Math.max(0, ((Date.now() - from) / (to - from)) * 100))
}

const PILL_TONES = {
  green:
    "bg-[#E3F6EC] text-[#14965A] [&>i]:bg-[#1FB86A] dark:bg-[#1FB86A]/18 dark:text-[#9BEBC0]",
  amber:
    "bg-[#FFF4E2] text-[#C2700A] [&>i]:bg-[#D9820F] dark:bg-[#D9820F]/18 dark:text-[#FBBF24]",
  red: "bg-[#FDECEC] text-[#DC2626] [&>i]:bg-[#DC2626] dark:bg-[#DC2626]/20 dark:text-[#FCA5A5]",
  gray: "bg-muted text-muted-foreground [&>i]:bg-muted-foreground",
} as const

function subscriptionTone(status: string): keyof typeof PILL_TONES {
  if (status === "active") return "green"
  if (status === "trialing" || status === "incomplete") return "amber"
  if (status === "past_due" || status === "unpaid" || status === "incomplete_expired") return "red"
  return "gray"
}

function invoiceTone(status: string): keyof typeof PILL_TONES {
  if (status === "paid") return "green"
  if (status === "open" || status === "draft") return "amber"
  if (status === "uncollectible" || status === "void") return "red"
  return "gray"
}

function StatusPill({
  tone,
  children,
  className,
}: {
  tone: keyof typeof PILL_TONES
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold capitalize",
        PILL_TONES[tone],
        className,
      )}
    >
      <i className="size-1.5 rounded-full" />
      {children}
    </span>
  )
}

const panelClass =
  "rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(14,27,22,0.04),0_12px_32px_-22px_rgba(14,27,22,0.22)] sm:p-7 dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),0_12px_32px_-22px_rgba(0,0,0,0.55)]"

const iconTileClass =
  "grid size-10 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary dark:border-[#1FB86A]/35 dark:bg-[#1FB86A]/15 dark:text-[#9BEBC0]"

const emptyPanelClass =
  "rounded-2xl border border-dashed border-border bg-muted/50 px-5 py-6 text-sm text-muted-foreground"

function PanelHead({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: LucideIcon
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-[-0.01em] text-foreground">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <span className={iconTileClass} aria-hidden>
        <Icon className="size-[18px]" />
      </span>
    </div>
  )
}

function DateTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card px-4 py-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-[17px] font-semibold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  )
}

export default function BillingPage() {
  const [overview, setOverview] = React.useState<BillingOverview | null>(null)
  const [invoices, setInvoices] = React.useState<BillingInvoice[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [spins, setSpins] = React.useState(0)

  async function reload() {
    const [nextOverview, nextInvoices] = await Promise.all([
      billingService.overview(),
      billingService.invoices(),
    ])
    setOverview(nextOverview)
    setInvoices(nextInvoices.invoices)
  }

  React.useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams(window.location.search)
        const sessionId = params.get("session_id") || undefined
        if (params.get("checkout") === "success") {
          toast.success("Stripe Checkout completed. Syncing your subscription…")
          if (sessionId) {
            await billingService.syncCheckout(sessionId)
          }
          window.history.replaceState({}, "", window.location.pathname)
        }
        await reload()
      } catch (caught) {
        setError(getErrorMessage(caught))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  async function refresh() {
    setSpins((n) => n + 1)
    if (refreshing) return
    setRefreshing(true)
    try {
      await reload()
      toast.success("Subscription refreshed")
    } catch (caught) {
      toast.error(getErrorMessage(caught))
    } finally {
      setRefreshing(false)
    }
  }

  async function openPortal() {
    setBusy(true)
    try {
      const { portalUrl } = await billingService.openBillingPortal()
      window.location.assign(portalUrl)
    } catch (caught) {
      toast.error(getErrorMessage(caught))
      setBusy(false)
    }
  }

  if (loading) return <LoadingSkeleton rows={4} />
  if (!overview && error) return <ErrorState message={error} />

  const sub = overview?.subscription
  const card = overview?.paymentMethod
  const hasCard = Boolean(card?.brand && card?.last4)
  const status = sub?.status || "inactive"
  const progress = periodProgress(sub?.currentPeriodStart, sub?.currentPeriodEnd)

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <header>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-primary uppercase dark:border-[#1FB86A]/35 dark:bg-[#1FB86A]/15 dark:text-[#9BEBC0]">
          <span className="size-1.5 rounded-full bg-[#1FB86A]" />
          Company admin
        </span>
        <h1 className="mt-3 text-[clamp(32px,3.4vw,46px)] leading-[1.05] font-bold tracking-[-0.035em] text-foreground">
          Subscription
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground sm:text-base">
          Your active plan, card on file, and invoices. Renewals run automatically via Stripe.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        {/* Active subscription */}
        <section className={panelClass}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-[-0.01em] text-foreground">Active subscription</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Current plan synced from Stripe.</p>
            </div>
            <button
              type="button"
              onClick={() => void refresh()}
              aria-label="Refresh subscription"
              aria-busy={refreshing}
              className={cn(
                iconTileClass,
                "transition-colors hover:border-[#1FB86A] hover:text-[#1FB86A]",
              )}
            >
              <RefreshCwIcon
                className="size-[18px] transition-transform duration-600 ease-[cubic-bezier(.2,.8,.2,1)]"
                style={{ transform: `rotate(${spins * 360}deg)` }}
              />
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="text-[clamp(36px,4vw,52px)] leading-none font-extrabold tracking-[-0.04em] text-primary dark:text-[#9BEBC0]">
              {sub?.plan?.name || "No active plan"}
            </p>
            <StatusPill tone={subscriptionTone(status)}>{status.replaceAll("_", " ")}</StatusPill>
            {sub?.interval ? (
              <span className="rounded-full bg-muted px-3 py-1 text-[13px] font-semibold text-foreground/80 capitalize">
                {sub.interval}
              </span>
            ) : null}
            {sub?.cancelAtPeriodEnd ? <StatusPill tone="red">Cancels at period end</StatusPill> : null}
          </div>

          {sub ? (
            <>
              {/* Billing period */}
              <div className="mt-6 rounded-2xl border border-border bg-muted/50 px-5 pt-4 pb-5 sm:px-7">
                <div className="flex items-center justify-between text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Period
                  <ArrowRightIcon className="size-3.5" aria-hidden />
                </div>
                <div
                  className="relative mt-3 h-5"
                  role="progressbar"
                  aria-label="Billing period elapsed"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border" />
                  <div
                    className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-linear-to-r from-[#3DD388] to-[#155A45] transition-[width] duration-700"
                    style={{ width: `${progress}%` }}
                  />
                  <span className="absolute top-1/2 left-0 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#1FB86A] bg-card" />
                  <span className="absolute top-1/2 right-0 size-5 translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#0A3326] bg-card dark:border-[#9BEBC0]" />
                </div>
                <div className="mt-3 flex items-center justify-between text-lg font-semibold tabular-nums text-foreground">
                  <span>{formatDate(sub.currentPeriodStart)}</span>
                  <span>{formatDate(sub.currentPeriodEnd)}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DateTile
                  icon={CalendarIcon}
                  label="Next renewal"
                  value={formatDate(sub.nextBillingDate || sub.currentPeriodEnd)}
                />
                {sub.trialEnd ? (
                  <DateTile icon={TimerIcon} label="Trial ends" value={formatDate(sub.trialEnd)} />
                ) : (
                  <DateTile icon={TimerIcon} label="Seats" value={String(sub.seats ?? "—")} />
                )}
              </div>
            </>
          ) : (
            <p className={cn("mt-6", emptyPanelClass)}>
              No active subscription yet. Choose a plan to start your trial.
            </p>
          )}
        </section>

        <div className="flex flex-col gap-6">
          {/* Card on file */}
          <section className={panelClass}>
            <PanelHead title="Card on file" description="Payment method used for renewals." icon={CreditCardIcon} />
            <div
              className={cn(
                "mt-5 flex flex-wrap items-center gap-4 rounded-2xl border p-4",
                hasCard ? "border-border bg-card" : "border-dashed border-border bg-muted/40",
              )}
              style={
                hasCard
                  ? undefined
                  : {
                      backgroundImage:
                        "repeating-linear-gradient(-45deg, transparent, transparent 10px, color-mix(in oklab, var(--muted) 80%, transparent) 10px, color-mix(in oklab, var(--muted) 80%, transparent) 20px)",
                    }
              }
            >
              <span className="grid h-9 w-12 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground">
                <CreditCardIcon className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                {hasCard ? (
                  <>
                    <p className="truncate text-[15px] font-semibold text-foreground capitalize">
                      {card?.brand} ···· {card?.last4}
                    </p>
                    {card?.expMonth && card?.expYear ? (
                      <p className="text-[13px] text-muted-foreground tabular-nums">
                        Expires {String(card.expMonth).padStart(2, "0")}/{card.expYear}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-[15px] font-semibold text-foreground/80">No card on file yet</p>
                )}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void openPortal()}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0A3326] px-4 text-sm font-semibold text-white shadow-[0_10px_22px_-12px_rgba(6,36,27,0.8)] transition-[transform,background-color] duration-150 hover:bg-[#0E4434] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <PencilIcon className="size-4" />
                {busy ? "Opening…" : "Manage card"}
              </button>
            </div>
          </section>

          {/* Invoice history */}
          <section className={panelClass}>
            <PanelHead title="Invoice history" description="Invoices from Stripe." icon={FileTextIcon} />
            {invoices.length === 0 ? (
              <p className={cn("mt-5 px-4 py-5", emptyPanelClass)}>No invoices yet.</p>
            ) : (
              <ul className="mt-5 flex flex-col gap-3">
                {invoices.map((invoice) => {
                  const downloadUrl = invoiceDownloadUrl(invoice)
                  return (
                    <li
                      key={invoice.id}
                      className="flex items-center gap-3.5 rounded-2xl border border-border bg-card px-4 py-3.5"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary dark:bg-[#1FB86A]/15 dark:text-[#9BEBC0]">
                        <FileTextIcon className="size-[18px]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-foreground">
                          {invoice.number || invoice.id}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <StatusPill tone={invoiceTone(invoice.status)} className="px-2 py-0.5 text-xs">
                            {invoice.status}
                          </StatusPill>
                          <span className="text-[13px] text-muted-foreground tabular-nums">
                            {formatDate(invoice.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="shrink-0 text-lg font-bold tabular-nums text-foreground">
                        {formatMoney(invoice.total, invoice.currency)}
                      </p>
                      {downloadUrl ? (
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          aria-label={`Download invoice ${invoice.number || invoice.id}`}
                          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[13px] font-semibold text-primary transition-colors hover:border-[#1FB86A] hover:bg-primary/10 dark:text-[#9BEBC0] dark:hover:bg-[#1FB86A]/15"
                        >
                          <DownloadIcon className="size-3.5" />
                          PDF
                        </a>
                      ) : (
                        <span className="shrink-0 rounded-lg bg-muted px-2.5 py-1 text-[13px] text-muted-foreground">
                          No file
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
