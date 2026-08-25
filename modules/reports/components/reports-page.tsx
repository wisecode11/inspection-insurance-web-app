"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FileDownIcon, Share2Icon } from "lucide-react"
import { toast } from "@/lib/toast"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

function pdfHref(pdfUrl?: string) {
  if (!pdfUrl) return ""
  if (pdfUrl.startsWith("http")) return pdfUrl
  const base = env.apiUrl.replace(/\/api\/?$/, "")
  return `${base}${pdfUrl.startsWith("/") ? "" : "/"}${pdfUrl}`
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

    const match = reports.find((row) => row.jobId === jobIdFilter)
    openedJobId.current = jobIdFilter

    if (match) {
      setSelected(match)
      return
    }

    toast.info("No report for this job yet", "Reports appear after the inspector submits work.")
  }, [jobIdFilter, reports, loading, error])

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

  if (loading) return <LoadingState label="Loading reports…" />
  if (error) return <ErrorState message={error} />

  const columns: Column<CompanyReport>[] = [
    {
      key: "title",
      header: "Report",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.title || "Assessment report"}</span>
          <span className="text-xs text-muted-foreground">
            {row.jobNumber || "—"}
            {row.jobTitle ? ` · ${row.jobTitle}` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer / property",
      cell: (row) => (
        <div className="flex flex-col">
          <span>{row.customerName || "—"}</span>
          <span className="text-xs text-muted-foreground">{row.propertyAddress || "—"}</span>
        </div>
      ),
    },
    {
      key: "inspector",
      header: "Inspector",
      cell: (row) => row.inspectorName || "—",
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge status={reportStatusVariant(row.status)} label={reportStatusLabel(row.status)} />
      ),
    },
    {
      key: "pdf",
      header: "PDF",
      cell: (row) => (
        <span className="capitalize text-muted-foreground">{row.pdfStatus || "—"}</span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Reports"
        description="Review reports submitted by inspectors — approve, reject, request changes, download, or share."
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
        toolbar={
          <Select value={status} onValueChange={(value) => setStatus((value as StatusFilter) || "all")}>
            <SelectTrigger className="w-[190px]">
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

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selected?.title || "Report"}</DialogTitle>
            <DialogDescription>
              {selected?.jobNumber} · {selected?.customerName || "Customer"} ·{" "}
              {reportStatusLabel(selected?.status || "draft")}
            </DialogDescription>
          </DialogHeader>

          {selected ? (
            <div className="flex flex-col gap-4 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Inspector</p>
                  <p className="font-medium">{selected.inspectorName || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Claim</p>
                  <p className="font-medium">{selected.claimNumber || "—"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground">Property</p>
                  <p className="font-medium">{selected.propertyAddress || "—"}</p>
                </div>
              </div>

              <div>
                <p className="mb-1 text-muted-foreground">Narrative</p>
                <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3">
                  {selected.narrative || "No narrative yet."}
                </p>
              </div>

              {selected.changesRequested ? (
                <div className="rounded-md border border-warning/30 bg-warning/10 p-3">
                  <p className="font-medium">Changes requested</p>
                  <p className="mt-1">{selected.changesRequested}</p>
                </div>
              ) : null}
              {selected.rejectionReason ? (
                <div className="rounded-md border border-danger/30 bg-danger/10 p-3">
                  <p className="font-medium">Rejection reason</p>
                  <p className="mt-1">{selected.rejectionReason}</p>
                </div>
              ) : null}

              <div className="flex flex-col gap-1.5">
                <Label>Review notes / reason</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional notes for approve, reject, or request changes"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {selected.status === "submitted" ? (
                  <Button
                    disabled={busy}
                    onClick={() =>
                      run(() => companyReportService.startReview(selected.id), "Marked under review")
                    }
                  >
                    Start review
                  </Button>
                ) : null}
                {["submitted", "under_review"].includes(selected.status) ? (
                  <>
                    <Button
                      disabled={busy}
                      onClick={() =>
                        run(() => companyReportService.approve(selected.id, notes), "Report approved")
                      }
                    >
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
                      Request changes
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={busy}
                      onClick={() =>
                        run(() => companyReportService.reject(selected.id, notes), "Report rejected")
                      }
                    >
                      Reject
                    </Button>
                  </>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2 border-t pt-3">
                <Button
                  variant="outline"
                  disabled={!selected.pdfUrl}
                  onClick={() => {
                    const href = pdfHref(selected.pdfUrl)
                    if (href) window.open(href, "_blank")
                  }}
                >
                  <FileDownIcon data-icon="inline-start" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
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
                  onClick={() => router.push(ROUTES.company.job(selected.jobId))}
                >
                  Open job
                </Button>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
