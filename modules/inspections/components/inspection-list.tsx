"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontalIcon, PlusIcon } from "lucide-react"
import { toast } from "@/lib/toast"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ErrorState, LoadingSkeleton } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { ROUTES } from "@/lib/constants/routes"
import { getErrorMessage } from "@/lib/api/errors"
import { useJobs } from "@/modules/inspections/hooks/use-jobs"
import { jobService } from "@/modules/inspections/services/job.service"
import {
  JOB_PRIORITY_OPTIONS,
  JOB_STATUS_OPTIONS,
  canReassignJob,
  canShowCancelJob,
  jobStatusLabel,
  jobStatusVariant,
  type JobPriority,
  type JobRow,
  type JobStatus,
} from "@/modules/inspections/types/job.types"
import { useStaff } from "@/modules/staff/hooks/use-staff"

function stopRowClick(event: React.MouseEvent) {
  event.stopPropagation()
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ""))
    reader.onerror = () => reject(new Error("Could not read attachment file"))
    reader.readAsDataURL(file)
  })
}

const MAX_ATTACHMENT_BYTES = 1_500_000

type StatusFilter = "all" | JobStatus

function formatJobDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

const emptyForm = {
  title: "",
  priority: "normal" as JobPriority,
  dueDate: "",
  customerName: "",
  phone: "",
  email: "",
  line1: "",
  city: "",
  state: "",
  postalCode: "",
  claimNumber: "",
  policyNumber: "",
  dateOfLoss: "",
  insuranceCompany: "",
  notes: "",
  attachmentName: "",
  attachmentUrl: "",
  attachmentMime: "",
  attachmentSize: 0,
  inspectorId: "unassigned",
}

export default function JobsPage() {
  const router = useRouter()
  const { data: jobs = [], isLoading, error, reload } = useJobs()
  const { data: staff = [] } = useStaff()
  const inspectors = staff.filter((member) => member.status === "active")
  const inspectorItems = React.useMemo(
    () => [
      { value: "unassigned", label: "Unassigned" },
      ...inspectors.map((member) => ({ value: member.id, label: member.name })),
    ],
    [inspectors],
  )
  const priorityItems = React.useMemo(
    () => JOB_PRIORITY_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    [],
  )
  const statusFilterItems = React.useMemo(
    () => [
      { value: "all", label: "All statuses" },
      ...JOB_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    ],
    [],
  )

  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [open, setOpen] = React.useState(false)
  const [bulkOpen, setBulkOpen] = React.useState(false)
  const [reassignOpen, setReassignOpen] = React.useState(false)
  const [reassignJob, setReassignJob] = React.useState<JobRow | null>(null)
  const [reassignInspectorId, setReassignInspectorId] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [bulkInspectorId, setBulkInspectorId] = React.useState("")
  const [bulkDueDate, setBulkDueDate] = React.useState("")
  const [bulkPriority, setBulkPriority] = React.useState<JobPriority | "">("")
  const [attachmentKey, setAttachmentKey] = React.useState(0)
  const [confirmAction, setConfirmAction] = React.useState<{
    type: "cancel" | "delete"
    job: JobRow
  } | null>(null)
  const [confirmBusy, setConfirmBusy] = React.useState(false)

  const rows = React.useMemo(
    () => jobs.filter((row) => status === "all" || row.status === status),
    [jobs, status],
  )

  function setField<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function clearAttachment() {
    setForm((prev) => ({
      ...prev,
      attachmentName: "",
      attachmentUrl: "",
      attachmentMime: "",
      attachmentSize: 0,
    }))
    setAttachmentKey((key) => key + 1)
  }

  async function onAttachmentSelected(file?: File | null) {
    if (!file) {
      clearAttachment()
      return
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error("Attachment must be under 1.5MB")
      clearAttachment()
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setForm((prev) => ({
        ...prev,
        attachmentName: file.name,
        attachmentUrl: dataUrl,
        attachmentMime: file.type || "application/octet-stream",
        attachmentSize: file.size,
      }))
    } catch (err) {
      toast.error(getErrorMessage(err))
      clearAttachment()
    }
  }

  function requestCancelJob(row: JobRow) {
    if (!canShowCancelJob(row)) return
    setConfirmAction({ type: "cancel", job: row })
  }

  function requestDeleteJob(row: JobRow) {
    setConfirmAction({ type: "delete", job: row })
  }

  async function confirmJobAction() {
    if (!confirmAction) return
    setConfirmBusy(true)
    try {
      if (confirmAction.type === "cancel") {
        await jobService.cancel(confirmAction.job.id)
        toast.success("Job cancelled. Use Reassign job to assign another inspector.")
      } else {
        await jobService.remove(confirmAction.job.id)
        toast.success("Job deleted")
      }
      setSelectedIds((ids) => ids.filter((id) => id !== confirmAction.job.id))
      setConfirmAction(null)
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setConfirmBusy(false)
    }
  }

  function openReassign(row: JobRow) {
    const otherInspectors = inspectors.filter((member) => member.id !== row.assignedTo)
    setReassignJob(row)
    setReassignInspectorId(otherInspectors[0]?.id || inspectors[0]?.id || "")
    setReassignOpen(true)
  }

  async function saveReassign() {
    if (!reassignJob || !reassignInspectorId) {
      toast.error("Select an inspector")
      return
    }
    setSaving(true)
    try {
      await jobService.assign(reassignJob.id, reassignInspectorId)
      toast.success("Job reassigned to inspector")
      setReassignOpen(false)
      setReassignJob(null)
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  function openCreate() {
    setForm(emptyForm)
    setAttachmentKey((key) => key + 1)
    setOpen(true)
  }

  async function saveJob() {
    if (
      !form.title.trim()
      || !form.customerName.trim()
      || !form.phone.trim()
      || !form.email.trim()
      || !form.line1.trim()
      || !form.city.trim()
      || !form.state.trim()
      || !form.postalCode.trim()
      || !form.claimNumber.trim()
      || !form.policyNumber.trim()
      || !form.insuranceCompany.trim()
      || !form.dateOfLoss
    ) {
      toast.error("Fill all required property, homeowner, insurance, and job fields")
      return
    }

    setSaving(true)
    try {
      const attachments =
        form.attachmentName.trim() && form.attachmentUrl.trim()
          ? [
              {
                name: form.attachmentName.trim(),
                url: form.attachmentUrl.trim(),
                mimeType: form.attachmentMime || undefined,
                size: form.attachmentSize || undefined,
              },
            ]
          : []

      await jobService.create({
        title: form.title.trim(),
        priority: form.priority,
        dueDate: form.dueDate || null,
        customer: {
          name: form.customerName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
        },
        address: {
          line1: form.line1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
        },
        claim: {
          claimNumber: form.claimNumber.trim(),
          policyNumber: form.policyNumber.trim(),
          dateOfLoss: form.dateOfLoss,
          insuranceCompany: form.insuranceCompany.trim(),
        },
        notes: form.notes.trim() || undefined,
        attachments,
        inspectorId: form.inspectorId === "unassigned" ? undefined : form.inspectorId,
      })
      toast.success("Job created")
      await reload()
      setOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function saveBulkAssign() {
    if (!selectedIds.length || !bulkInspectorId) {
      toast.error("Select jobs and an inspector")
      return
    }
    setSaving(true)
    try {
      await jobService.bulkAssign(selectedIds, bulkInspectorId, {
        dueDate: bulkDueDate || null,
        priority: bulkPriority || undefined,
      })
      toast.success(`${selectedIds.length} job(s) assigned`)
      setSelectedIds([])
      setBulkOpen(false)
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} />

  const columns: Column<JobRow>[] = [
    {
      key: "select",
      header: "",
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onClick={(event) => event.stopPropagation()}
          onChange={() => toggleSelected(row.id)}
        />
      ),
    },
    {
      key: "jobNumber",
      header: "Job",
      sortable: true,
      accessor: (row) => row.jobNumber,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium tabular-nums">{row.jobNumber}</span>
          <span className="text-xs text-muted-foreground">{row.title || "Untitled"}</span>
        </div>
      ),
    },
    {
      key: "addressLine",
      header: "Property / homeowner",
      sortable: true,
      className: "max-w-[18rem] whitespace-normal sm:max-w-[22rem] lg:max-w-[28rem]",
      accessor: (row) => row.addressLine,
      cell: (row) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-medium break-words whitespace-normal">
            {row.addressLine || "—"}
          </span>
          <span className="text-xs break-words whitespace-normal text-muted-foreground">
            {row.customerName || "—"}
            {row.claim?.claimNumber ? ` · Claim ${row.claim.claimNumber}` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "inspector",
      header: "Inspector",
      sortable: true,
      accessor: (row) => row.inspector,
    },
    {
      key: "priority",
      header: "Priority",
      cell: (row) => <span className="capitalize">{row.priority || "normal"}</span>,
    },
    {
      key: "dueDate",
      header: "Due",
      cell: (row) => (
        <span className="tabular-nums text-muted-foreground">{formatJobDate(row.dueDate)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => row.status,
      cell: (row) => (
        <StatusBadge status={jobStatusVariant(row.status)} label={jobStatusLabel(row.status)} />
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (row) => (
        <div onClick={stopRowClick}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Job actions">
                  <MoreHorizontalIcon />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Job actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(ROUTES.company.job(row.id))}>
                  View job
                </DropdownMenuItem>
                {canShowCancelJob(row) ? (
                  <DropdownMenuItem onClick={() => requestCancelJob(row)}>
                    Cancel job
                  </DropdownMenuItem>
                ) : null}
                {!row.assignedTo && canReassignJob(row.status) ? (
                  <DropdownMenuItem onClick={() => openReassign(row)}>
                    Reassign job
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`${ROUTES.company.reports}?jobId=${encodeURIComponent(row.id)}`)
                  }
                >
                  Open reports
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => requestDeleteJob(row)}>
                  Delete job
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Company workspace"
        title="Jobs"
        description="Create jobs, assign or reassign inspectors, cancel assignments, and track status."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!selectedIds.length}
              onClick={() => {
                setBulkInspectorId(inspectors[0]?.id || "")
                setBulkOpen(true)
              }}
            >
              Bulk assign ({selectedIds.length})
            </Button>
            <Button variant="default" onClick={openCreate}>
              <PlusIcon data-icon="inline-start" />
              New job
            </Button>
          </div>
        }
      />

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search job, address, homeowner, or inspector…"
        searchKeys={["jobNumber", "title", "addressLine", "city", "inspector", "customerName"]}
        emptyTitle="No jobs yet"
        emptyDescription="Create a job with property, homeowner, and insurance details."
        onRowClick={(row) => router.push(ROUTES.company.job(row.id))}
        toolbar={
          <Select
            value={status}
            onValueChange={(value) => setStatus((value as StatusFilter) || "all")}
            items={statusFilterItems}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusFilterItems.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <FormDrawer
        open={open}
        onOpenChange={setOpen}
        title="New job"
        description="Property, homeowner, insurance, and job details. Attach a claim/policy file from your device if needed."
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveJob} disabled={saving}>
              {saving ? "Creating…" : "Create job"}
            </Button>
          </>
        }
      >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Job title</Label>
              <Input value={form.title} onChange={(e) => setField("title", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) => setField("priority", (value as JobPriority) || "normal")}
                items={priorityItems}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Due date</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setField("dueDate", e.target.value)}
              />
            </div>

            <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Property information
            </p>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Property address</Label>
              <Input value={form.line1} onChange={(e) => setField("line1", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setField("city", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => setField("state", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Zip code</Label>
              <Input value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value)} />
            </div>

            <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Homeowner information
            </p>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Homeowner name</Label>
              <Input value={form.customerName} onChange={(e) => setField("customerName", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
            </div>

            <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Insurance information
            </p>
            <div className="flex flex-col gap-1.5">
              <Label>Claim number</Label>
              <Input value={form.claimNumber} onChange={(e) => setField("claimNumber", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Policy number</Label>
              <Input value={form.policyNumber} onChange={(e) => setField("policyNumber", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Carrier name</Label>
              <Input
                value={form.insuranceCompany}
                onChange={(e) => setField("insuranceCompany", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Date of loss</Label>
              <Input
                type="date"
                value={form.dateOfLoss}
                onChange={(e) => setField("dateOfLoss", e.target.value)}
              />
            </div>

            <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Assignment & notes
            </p>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Assign inspector</Label>
              <Select
                value={form.inspectorId}
                onValueChange={(value) => setField("inspectorId", value || "unassigned")}
                items={inspectorItems}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {inspectorItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} rows={3} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Attachment (optional)</Label>
              <Input
                key={attachmentKey}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
                onChange={(e) => onAttachmentSelected(e.target.files?.[0])}
              />
              {form.attachmentName ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground truncate">{form.attachmentName}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={clearAttachment}>
                    Remove
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Upload a claim/policy PDF or photo from your computer (max 1.5MB). No external URL needed.
                </p>
              )}
            </div>
          </div>
      </FormDrawer>

      <FormDrawer
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title="Bulk assign jobs"
        description={`Assign ${selectedIds.length} selected job(s) to one inspector.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={saveBulkAssign}>
              {saving ? "Assigning…" : "Assign jobs"}
            </Button>
          </>
        }
      >
          <div className="grid gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Inspector</Label>
              <Select
                value={bulkInspectorId}
                onValueChange={(value) => setBulkInspectorId(value || "")}
                items={inspectors.map((member) => ({ value: member.id, label: member.name }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {inspectors.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Due date (optional)</Label>
              <Input type="date" value={bulkDueDate} onChange={(e) => setBulkDueDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Priority (optional)</Label>
              <Select
                value={bulkPriority || "keep"}
                onValueChange={(value) => setBulkPriority(value === "keep" ? "" : (value as JobPriority))}
                items={[
                  { value: "keep", label: "Keep existing" },
                  ...priorityItems,
                ]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">Keep existing</SelectItem>
                  {JOB_PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
      </FormDrawer>

      <FormDrawer
        open={reassignOpen}
        onOpenChange={(next) => {
          setReassignOpen(next)
          if (!next) setReassignJob(null)
        }}
        title="Reassign job"
        description={
          reassignJob
            ? `${reassignJob.jobNumber} is unassigned — pick an inspector.`
            : "Pick an inspector for this job."
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setReassignOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button disabled={saving || !reassignInspectorId} onClick={() => void saveReassign()}>
              {saving ? "Saving…" : "Reassign job"}
            </Button>
          </>
        }
      >
          <div className="flex flex-col gap-1.5">
            <Label>Inspector</Label>
            <Select
              value={reassignInspectorId}
              onValueChange={(value) => setReassignInspectorId(value || "")}
              items={inspectors.map((member) => ({ value: member.id, label: member.name }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {inspectors.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                    {reassignJob?.assignedTo === member.id ? " (current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      </FormDrawer>

      <FormDrawer
        open={!!confirmAction}
        onOpenChange={(next) => {
          if (!next && !confirmBusy) setConfirmAction(null)
        }}
        title={confirmAction?.type === "delete" ? "Delete job?" : "Cancel job?"}
        description={
          confirmAction?.type === "delete"
            ? `${confirmAction.job.jobNumber} will be removed from the jobs list.`
            : `${confirmAction?.job.jobNumber} — inspector will be unassigned. You can reassign afterward.`
        }
        size="default"
        footer={
          <>
            <Button
              variant="outline"
              disabled={confirmBusy}
              onClick={() => setConfirmAction(null)}
            >
              Keep job
            </Button>
            <Button
              variant="destructive"
              disabled={confirmBusy}
              onClick={() => void confirmJobAction()}
            >
              {confirmBusy
                ? confirmAction?.type === "delete"
                  ? "Deleting…"
                  : "Cancelling…"
                : confirmAction?.type === "delete"
                  ? "Delete job"
                  : "Cancel job"}
            </Button>
          </>
        }
      />
    </>
  )
}
