"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  CameraIcon,
  FileDownIcon,
  Share2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ROUTES } from "@/lib/constants/routes"
import { env } from "@/lib/config/env"
import { getErrorMessage } from "@/lib/api/errors"
import { useJob } from "@/modules/inspections/hooks/use-job"
import { jobService } from "@/modules/inspections/services/job.service"
import { reportService } from "@/modules/inspections/services/report.service"
import {
  jobStatusLabel,
  jobStatusVariant,
  nextJobStatuses,
  type JobStatus,
} from "@/modules/inspections/types/job.types"
import { useStaff } from "@/modules/staff/hooks/use-staff"

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { data: job, isLoading, error, reload } = useJob(params.id)
  const { data: staff = [] } = useStaff()
  const inspectors = staff.filter((member) => member.status === "active")

  const [narrative, setNarrative] = React.useState("")
  const [assignId, setAssignId] = React.useState("unassigned")
  const [priority, setPriority] = React.useState("normal")
  const [dueDate, setDueDate] = React.useState("")
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    if (!job) return
    const latest = job.reports?.[0]?.narrative || job.inspection?.summary?.overallNotes || job.notes || ""
    setNarrative(latest)
    setAssignId(job.assignedTo || "unassigned")
    setPriority(job.priority || "normal")
    setDueDate(job.dueDate ? String(job.dueDate).slice(0, 10) : "")
  }, [job])

  if (isLoading) return <LoadingState label="Loading job…" />
  if (error) return <ErrorState message={error} />

  if (!job) {
    return (
      <Empty className="border py-20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CameraIcon />
          </EmptyMedia>
          <EmptyTitle>Job not found</EmptyTitle>
          <EmptyDescription>That job id is not in this company workspace.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => router.push(ROUTES.company.jobs)}>
            Back to jobs
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const transitions = nextJobStatuses(job.status)
  const canReject = !["rejected", "completed", "cancelled", "archived"].includes(job.status)
  const photos = job.photos || []
  const warnings = job.reports?.[0]?.warnings || []
  const progress = job.progress

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true)
    try {
      await action()
      toast.success(success)
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Jobs & reports"
        title={job.title || job.addressLine || job.jobNumber}
        description={`${job.customerName || "Homeowner"} · ${job.jobNumber} · ${job.inspector}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => router.push(ROUTES.company.jobs)}>
              <ArrowLeftIcon data-icon="inline-start" />
              Back
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const shared = await reportService.share(job.id)
                  const url = shared.share.url.startsWith("http")
                    ? shared.share.url
                    : `${window.location.origin}${shared.share.url}`
                  await navigator.clipboard.writeText(url)
                }, "Evidence package share link copied")
              }
            >
              <Share2Icon data-icon="inline-start" />
              Share evidence
            </Button>
            <Button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const report = await reportService.generate(job.id, narrative)
                  if (report.pdfUrl) {
                    const url = report.pdfUrl.startsWith("http")
                      ? report.pdfUrl
                      : `${env.apiUrl.replace(/\/$/, "")}${report.pdfUrl}`
                    window.open(url, "_blank")
                  }
                }, "PDF generated")
              }
            >
              <FileDownIcon data-icon="inline-start" />
              Generate PDF
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={jobStatusVariant(job.status)} label={jobStatusLabel(job.status)} />
        {progress?.notStarted ? <StatusBadge status="draft" label="Not started" /> : null}
        {progress?.inProgress ? <StatusBadge status="in_progress" label="In progress" /> : null}
        {progress?.review ? <StatusBadge status="submitted" label="Review" /> : null}
        {progress?.completed ? <StatusBadge status="completed" label="Completed" /> : null}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Track created, due, submission, review, and completion dates.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <p className="text-muted-foreground">Current status</p>
            <p className="font-medium">{jobStatusLabel(job.status)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Assigned inspector</p>
            <p className="font-medium">{job.inspector}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created date</p>
            <p className="font-medium">{formatDate(job.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Due date</p>
            <p className="font-medium">{formatDate(job.dueDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Submission date</p>
            <p className="font-medium">{formatDate(job.submittedAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Review date</p>
            <p className="font-medium">{formatDate(job.reviewedAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Completion date</p>
            <p className="font-medium">{formatDate(job.completedAt)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Property & claim</CardTitle>
            <CardDescription>Details captured when the job was created.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">Homeowner</p>
              <p className="font-medium">{job.customerName || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone / email</p>
              <p className="font-medium">
                {job.customer?.phone || "—"} · {job.customer?.email || "—"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Property address</p>
              <p className="font-medium">{job.addressLine || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Claim number</p>
              <p className="font-medium">{job.claim?.claimNumber || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Policy number</p>
              <p className="font-medium">{job.claim?.policyNumber || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date of loss</p>
              <p className="font-medium">{formatDate(job.claim?.dateOfLoss)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Carrier name</p>
              <p className="font-medium">{job.claim?.insuranceCompany || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Priority</p>
              <p className="font-medium capitalize">{job.priority || "normal"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Notes</p>
              <p className="font-medium whitespace-pre-wrap">{job.notes || "—"}</p>
            </div>
            {(job.attachments || []).length > 0 ? (
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Attachments</p>
                <ul className="mt-1 space-y-1">
                  {job.attachments?.map((item) => (
                    <li key={`${item.name}-${item.url}`}>
                      <a className="text-terracotta underline" href={item.url} target="_blank" rel="noreferrer">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment & status</CardTitle>
            <CardDescription>Reassign inspectors and advance the job workflow.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Inspector</Label>
              <Select value={assignId} onValueChange={(value) => setAssignId(value || "unassigned")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {inspectors.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  if (assignId === "unassigned") {
                    await jobService.unassign(job.id)
                  } else {
                    await jobService.assign(job.id, assignId, {
                      dueDate: dueDate || null,
                      priority: priority as "low" | "normal" | "high" | "urgent",
                    })
                  }
                }, "Assignment updated")
              }
            >
              Save assignment
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value || "normal")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Due date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                run(
                  () =>
                    jobService.update(job.id, {
                      priority: priority as "low" | "normal" | "high" | "urgent",
                      dueDate: dueDate || null,
                    }),
                  "Priority / due date saved",
                )
              }
            >
              Save priority & due date
            </Button>

            {transitions.length > 0 ? (
              <div className="flex flex-col gap-2">
                <Label>Advance status</Label>
                {transitions.map((status) => (
                  <Button
                    key={status}
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      run(
                        () => jobService.setStatus(job.id, status as JobStatus),
                        `Moved to ${jobStatusLabel(status)}`,
                      )
                    }
                  >
                    Mark {jobStatusLabel(status)}
                  </Button>
                ))}
              </div>
            ) : null}

            {canReject ? (
              <Button
                variant="destructive"
                disabled={busy}
                onClick={() => run(() => jobService.cancel(job.id), "Job rejected")}
              >
                Reject job
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report narrative & review</CardTitle>
          <CardDescription>
            Edit the report-level narrative for this inspection. Administrative template defaults still
            control future reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            value={narrative}
            onChange={(event) => setNarrative(event.target.value)}
            rows={6}
            placeholder="Write or adjust the assessment narrative for this report…"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                run(() => reportService.updateNarrative(job.id, narrative), "Narrative saved")
              }
            >
              Save narrative
            </Button>
            <Button
              disabled={busy || !["submitted", "reviewed", "review_required"].includes(job.status)}
              onClick={() =>
                run(async () => {
                  if (job.status === "submitted" || job.status === "review_required") {
                    await jobService.setStatus(job.id, "reviewed")
                    await jobService.setStatus(job.id, "completed")
                    return
                  }
                  await jobService.setStatus(job.id, "completed")
                }, "Review completed")
              }
            >
              Complete review
            </Button>
          </div>
          {warnings.length > 0 ? (
            <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
              <p className="font-medium">Warnings</p>
              <ul className="mt-1 list-disc pl-5">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photos & notes</CardTitle>
          <CardDescription>Evidence captured for this job.</CardDescription>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No photos synced yet. Inspectors upload evidence from the mobile app.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <div key={photo.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{photo.caption || photo.subjectType || "Photo"}</p>
                  <p className="text-xs text-muted-foreground">{photo.status}</p>
                  {photo.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo.url} alt={photo.caption || "Evidence"} className="mt-2 rounded-md" />
                  ) : null}
                </div>
              ))}
            </div>
          )}
          {job.inspection?.summary?.overallNotes ? (
            <div className="mt-4 rounded-md bg-muted/50 p-3 text-sm">
              <p className="font-medium">Inspector notes</p>
              <p className="mt-1 whitespace-pre-wrap">{job.inspection.summary.overallNotes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  )
}
