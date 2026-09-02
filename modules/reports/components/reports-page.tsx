"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CheckIcon,
  ExternalLinkIcon,
  EyeIcon,
  FileDownIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  Share2Icon,
  Undo2Icon,
  XIcon,
} from "lucide-react"
import { toast } from "@/lib/toast"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ErrorState, LoadingSkeleton } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormDrawer } from "@/components/shared/form-drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { env } from "@/lib/config/env"
import { ROUTES } from "@/lib/constants/routes"
import { getErrorMessage } from "@/lib/api/errors"
import { companyReportService } from "@/modules/reports/services/company-report.service"
import {
  ADMIN_REPORT_STATUS_OPTIONS,
  reportStatusLabel,
  reportStatusVariant,
  type CompanyReport,
  type ReportStatus,
} from "@/modules/reports/types/report.types"

type StatusFilter = "all" | ReportStatus

const OBJECT_ID_RE = /^[a-f\d]{24}$/i

function pdfHref(pdfUrl?: string) {
  if (!pdfUrl) return ""
  if (pdfUrl.startsWith("http")) return pdfUrl
  const base = env.apiUrl.replace(/\/api\/?$/, "")
  return `${base}${pdfUrl.startsWith("/") ? "" : "/"}${pdfUrl}`
}

function formatWhen(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function stopRowNav(event: React.MouseEvent) {
  event.stopPropagation()
}

function resolveJobId(report: CompanyReport): string {
  const fromJob = report.job?.id
  if (fromJob && OBJECT_ID_RE.test(fromJob)) return fromJob
  if (report.jobId && OBJECT_ID_RE.test(report.jobId)) return report.jobId
  return ""
}

export default function ReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobIdFilter = searchParams.get("jobId")
  const [reports, setReports] = React.useState<CompanyReport[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [selected, setSelected] = React.useState<CompanyReport | null>(null)
  const [notes, setNotes] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const openedJobId = React.useRef<string | null>(null)

  async function reload() {
    const rows = await companyReportService.list(status === "all" ? undefined : status)
    setReports(rows)
    return rows
  }

  React.useEffect(() => {
    setLoading(true)
    reload()
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [status])

  React.useEffect(() => {
    if (!jobIdFilter || loading || error) return
    if (openedJobId.current === jobIdFilter) return
    if (!OBJECT_ID_RE.test(jobIdFilter)) {
      openedJobId.current = jobIdFilter
      router.replace(ROUTES.company.reports)
      return
    }

    const match = reports.find((row) => resolveJobId(row) === jobIdFilter)
    openedJobId.current = jobIdFilter

    if (match) {
      setSelected(match)
      router.replace(ROUTES.company.reports)
      return
    }

    // Only warn when deep-linked from a job that has no submitted report yet.
    toast.info("No report for this job yet", "Reports appear after the inspector submits work.")
    router.replace(ROUTES.company.reports)
  }, [jobIdFilter, reports, loading, error, router])

  async function run(action: () => Promise<unknown>, success: string) {
    if (!selected) return
    setBusy(true)
    try {
      await action()
      toast.success(success)
      await reload()
      const fresh = await companyReportService.getById(selected.id)
      setSelected(fresh)
      setNotes("")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  function openPdf(report: CompanyReport) {
    const href = pdfHref(report.pdfUrl)
    if (!href) {
      toast.error("PDF is not ready yet")
      return
    }
    window.open(href, "_blank", "noopener,noreferrer")
  }

  function openJob(report: CompanyReport) {
    const jobId = resolveJobId(report)
    if (!jobId) {
      toast.error("This report is missing a valid job link")
      return
    }
    router.push(ROUTES.company.job(jobId))
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} />

  const selectedJobId = selected ? resolveJobId(selected) : ""
  const canReview = selected
    ? ["submitted", "under_review"].includes(selected.status)
    : false

  const columns: Column<CompanyReport>[] = [
    {
      key: "title",
      header: "Report",
      className: "min-w-[160px] max-w-[220px]",
      cell: (row) => {
        const jobId = resolveJobId(row)
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-medium">{row.title || "Assessment report"}</span>
            {jobId ? (
              <Link
                href={ROUTES.company.job(jobId)}
                onClick={stopRowNav}
                className="inline-flex max-w-full items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <span className="truncate">
                  {row.jobNumber || "Open job"}
                  {row.jobTitle ? ` · ${row.jobTitle}` : ""}
                </span>
                <ExternalLinkIcon className="size-3 shrink-0 opacity-70" />
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground">{row.jobNumber || "—"}</span>
            )}
          </div>
        )
      },
    },
    {
      key: "customer",
      header: "Customer / property",
      className: "min-w-[200px] max-w-[280px]",
      cell: (row) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="break-words font-medium leading-snug whitespace-normal">
            {row.customerName || "—"}
          </span>
          <span className="break-words text-xs leading-snug text-muted-foreground whitespace-normal">
            {row.propertyAddress || "No property address"}
          </span>
        </div>
      ),
    },
    {
      key: "inspector",
      header: "Inspector",
      className: "min-w-[120px] max-w-[160px]",
      cell: (row) =>
        row.inspectorId && OBJECT_ID_RE.test(row.inspectorId) ? (
          <Link
            href={`${ROUTES.company.staff}?inspectorId=${encodeURIComponent(row.inspectorId)}`}
            onClick={stopRowNav}
            className="break-words font-medium text-primary hover:underline"
          >
            {row.inspectorName || "Inspector"}
          </Link>
        ) : (
          <span className="break-words">{row.inspectorName || "—"}</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      className: "whitespace-nowrap",
      cell: (row) => (
        <StatusBadge status={reportStatusVariant(row.status)} label={reportStatusLabel(row.status)} />
      ),
    },
    {
      key: "submittedAt",
      header: "Submitted",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (row) => (
        <span className="text-xs">{formatWhen(row.submittedAt || row.updatedAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[1%] whitespace-nowrap",
      cell: (row) => {
        const jobId = resolveJobId(row)
        return (
          <div onClick={stopRowNav}>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Actions for ${row.title || "report"}`}
                  >
                    <MoreHorizontalIcon />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Report actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSelected(row)}>
                    Review report
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={!row.pdfUrl} onClick={() => openPdf(row)}>
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled={!jobId} onClick={() => openJob(row)}>
                    Open job
                  </DropdownMenuItem>
                  {row.inspectorId && OBJECT_ID_RE.test(row.inspectorId) ? (
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `${ROUTES.company.staff}?inspectorId=${encodeURIComponent(row.inspectorId!)}`,
                        )
                      }
                    >
                      View inspector
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Reports"
        description="Review inspector evidence packages — open the job or staff profile, download the PDF, then approve, reject, or request changes."
      />

      <DataTable
        data={reports}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search report, job, customer, inspector…"
        searchKeys={["title", "jobNumber", "jobTitle", "customerName", "inspectorName", "propertyAddress"]}
        emptyTitle="No submitted reports yet"
        emptyDescription="Reports appear here only after an inspector submits their work from the field."
        onRowClick={(row) => setSelected(row)}
        emptyIcon={FileTextIcon}
        toolbar={
          <Select value={status} onValueChange={(value) => setStatus((value as StatusFilter) || "all")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All review statuses</SelectItem>
              {ADMIN_REPORT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <FormDrawer
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.title || "Report"}
        size="xl"
        footer={
          <Button variant="outline" onClick={() => setSelected(null)}>
            Close
          </Button>
        }
      >
          {selected ? (
            <div className="flex flex-col gap-5 text-sm">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
                <StatusBadge
                  status={reportStatusVariant(selected.status || "draft")}
                  label={reportStatusLabel(selected.status || "draft")}
                />
                <span>·</span>
                <span>Submitted {formatWhen(selected.submittedAt || selected.updatedAt)}</span>
              </div>
              <div className="grid gap-3 rounded-lg border border-border bg-primary-tint/40 p-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Job</p>
                  {selectedJobId ? (
                    <Link
                      href={ROUTES.company.job(selectedJobId)}
                      className="mt-1 inline-flex max-w-full items-center gap-1 font-medium text-primary hover:underline"
                    >
                      <span className="truncate">
                        {selected.jobNumber || "Open job"}
                        {selected.jobTitle ? ` · ${selected.jobTitle}` : ""}
                      </span>
                      <ExternalLinkIcon className="size-3.5 shrink-0" />
                    </Link>
                  ) : (
                    <p className="mt-1 font-medium">{selected.jobNumber || "—"}</p>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Inspector</p>
                  {selected.inspectorId && OBJECT_ID_RE.test(selected.inspectorId) ? (
                    <Link
                      href={`${ROUTES.company.staff}?inspectorId=${encodeURIComponent(selected.inspectorId)}`}
                      className="mt-1 inline-flex max-w-full items-center gap-1 font-medium text-primary hover:underline"
                    >
                      <span className="break-words">{selected.inspectorName || "Inspector"}</span>
                      <ExternalLinkIcon className="size-3.5 shrink-0" />
                    </Link>
                  ) : (
                    <p className="mt-1 break-words font-medium">{selected.inspectorName || "—"}</p>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="mt-1 break-words font-medium">{selected.customerName || "—"}</p>
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Claim</p>
                  <p className="mt-1 font-medium">{selected.claimNumber || "—"}</p>
                </div>

                <div className="min-w-0 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Property</p>
                  <p className="mt-1 break-words font-medium leading-snug">
                    {selected.propertyAddress || "—"}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Narrative</p>
                <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-primary-tint/50 p-3 leading-relaxed">
                  {selected.narrative || "No narrative yet."}
                </p>
              </div>

              {selected.changesRequested ? (
                <div className="rounded-md border border-warning/30 bg-warning/10 p-3">
                  <p className="font-medium">Changes requested</p>
                  <p className="mt-1 break-words">{selected.changesRequested}</p>
                </div>
              ) : null}
              {selected.rejectionReason ? (
                <div className="rounded-md border border-danger/30 bg-danger/10 p-3">
                  <p className="font-medium">Rejection reason</p>
                  <p className="mt-1 break-words">{selected.rejectionReason}</p>
                </div>
              ) : null}
              {selected.reviewNotes ? (
                <div className="rounded-md border border-border bg-primary-tint/60 p-3">
                  <p className="font-medium">Admin remarks</p>
                  <p className="mt-1 whitespace-pre-wrap break-words">{selected.reviewNotes}</p>
                </div>
              ) : null}

              {canReview ? (
                <div className="flex flex-col gap-3 rounded-lg border p-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="report-review-notes">Review notes / reason</Label>
                    <Textarea
                      id="report-review-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Notes saved with approve, reject, or request changes"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selected.status === "submitted" ? (
                      <Button
                        variant="secondary"
                        disabled={busy}
                        onClick={() =>
                          run(() => companyReportService.startReview(selected.id), "Marked under review")
                        }
                      >
                        <EyeIcon data-icon="inline-start" />
                        Start review
                      </Button>
                    ) : null}
                    <Button
                      disabled={busy}
                      onClick={() =>
                        run(() => companyReportService.approve(selected.id, notes), "Report approved")
                      }
                    >
                      <CheckIcon data-icon="inline-start" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => companyReportService.requestChanges(selected.id, notes),
                          "Changes requested",
                        )
                      }
                    >
                      <Undo2Icon data-icon="inline-start" />
                      Request changes
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={busy}
                      onClick={() =>
                        run(() => companyReportService.reject(selected.id, notes), "Report rejected")
                      }
                    >
                      <XIcon data-icon="inline-start" />
                      Reject
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  disabled={!selected.pdfUrl}
                  onClick={() => openPdf(selected)}
                >
                  <FileDownIcon data-icon="inline-start" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || !selected.pdfUrl}
                  onClick={() =>
                    run(async () => {
                      const shared = await companyReportService.share(selected.id)
                      const href = pdfHref(shared.share.pdfUrl || shared.share.url)
                      await navigator.clipboard.writeText(href || shared.share.url)
                    }, "Share link copied")
                  }
                >
                  <Share2Icon data-icon="inline-start" />
                  Share report
                </Button>
                <Button
                  variant="ghost"
                  disabled={!selectedJobId}
                  onClick={() => openJob(selected)}
                >
                  Open job
                </Button>
                {selected.inspectorId && OBJECT_ID_RE.test(selected.inspectorId) ? (
                  <Button
                    variant="ghost"
                    render={
                      <Link
                        href={`${ROUTES.company.staff}?inspectorId=${encodeURIComponent(selected.inspectorId)}`}
                      />
                    }
                  >
                    View inspector
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
      </FormDrawer>
    </>
  )
}
