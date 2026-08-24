"use client"

import * as React from "react"
import { MoreHorizontalIcon, UserPlusIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { PasswordField } from "@/modules/auth/components/password-field"
import { staffService } from "@/modules/staff/services/staff.service"
import { useStaff } from "@/modules/staff/hooks/use-staff"
import type { InspectorHistoryItem, StaffMember } from "@/modules/staff/types/staff.types"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { getErrorMessage } from "@/lib/api/errors"
import { getStoredUser } from "@/lib/auth/user-storage"

function stopRowClick(event: React.MouseEvent) {
  event.stopPropagation()
}

function statusVariant(status: string) {
  if (status === "active") return "active" as const
  if (status === "suspended") return "suspended" as const
  return "canceled" as const
}

type StaffActionsProps = {
  member: StaffMember
  onEdit: (member: StaffMember) => void
  onHistory: (member: StaffMember) => void
  onReassign: (member: StaffMember) => void
  onResetPassword: (member: StaffMember) => void
  onSetStatus: (member: StaffMember, status: "active" | "suspended" | "deactivated") => void
}

function StaffRowActions({
  member,
  onEdit,
  onHistory,
  onReassign,
  onResetPassword,
  onSetStatus,
}: StaffActionsProps) {
  return (
    <div onClick={stopRowClick}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${member.name}`}>
              <MoreHorizontalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{member.name}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                onEdit(member)
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onHistory(member)
              }}
            >
              Job history
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onReassign(member)
              }}
            >
              Reassign jobs
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onResetPassword(member)
              }}
            >
              Reset password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {member.status === "active" ? (
              <DropdownMenuItem
                onClick={() => {
                  onSetStatus(member, "suspended")
                }}
              >
                Suspend
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  onSetStatus(member, "active")
                }}
              >
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                onSetStatus(member, "deactivated")
              }}
            >
              Deactivate
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default function StaffPage() {
  const user = getStoredUser()
  const isAdmin = user?.role === "company_admin"
  const { data: inspectors = [], isLoading, error, reload } = useStaff()

  const [open, setOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const [reassignOpen, setReassignOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [actionMember, setActionMember] = React.useState<StaffMember | null>(null)
  const [history, setHistory] = React.useState<InspectorHistoryItem[]>([])
  const [reassignTargetId, setReassignTargetId] = React.useState("")
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [password, setPassword] = React.useState("")

  const reassignTargetItems = React.useMemo(
    () =>
      inspectors
        .filter((item) => item.id !== actionMember?.id && item.status === "active")
        .map((item) => ({ value: item.id, label: item.name })),
    [inspectors, actionMember?.id],
  )

  function resetForm() {
    setName("")
    setEmail("")
    setPhone("")
    setPassword("")
    setActionMember(null)
  }

  function openAdd() {
    resetForm()
    setOpen(true)
  }

  function openEdit(member: StaffMember) {
    setActionMember(member)
    setName(member.name)
    setEmail(member.email)
    setPhone(member.profile?.phone || "")
    setPassword("")
    setEditOpen(true)
  }

  async function saveCreate() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Name, email, and password are required")
      return
    }
    if (password.trim().length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setSaving(true)
    try {
      const result = await staffService.create({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      })
      toast.success(
        result.emailSent
          ? `Inspector added. Login details sent to ${email.trim()}`
          : "Inspector added. Share the password you set.",
      )
      await reload()
      setOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit() {
    if (!actionMember) return
    setSaving(true)
    try {
      await staffService.update(actionMember.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        password: password.trim() || undefined,
      })
      toast.success(`${actionMember.name} updated`)
      await reload()
      setEditOpen(false)
      setActionMember(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function setStatus(member: StaffMember, status: "active" | "suspended" | "deactivated") {
    try {
      await staffService.setStatus(member.id, status)
      toast.success(`${member.name} ${status}`)
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function resetPassword(member: StaffMember) {
    try {
      const result = await staffService.resetPassword(member.id)
      toast.success(
        result.emailSent
          ? `Password reset emailed to ${member.name}`
          : `${member.name} temporary password: ${result.temporaryPassword}`,
      )
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function openHistory(member: StaffMember) {
    try {
      const result = await staffService.history(member.id)
      setActionMember(member)
      setHistory(result.history)
      setHistoryOpen(true)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  function openReassign(member: StaffMember) {
    setActionMember(member)
    setReassignTargetId(
      inspectors.find((item) => item.id !== member.id && item.status === "active")?.id || "",
    )
    setReassignOpen(true)
  }

  async function saveReassign() {
    if (!actionMember || !reassignTargetId) {
      toast.error("Select a target inspector")
      return
    }
    setSaving(true)
    try {
      const result = await staffService.reassignJobs(actionMember.id, reassignTargetId)
      const targetName =
        inspectors.find((item) => item.id === reassignTargetId)?.name || "selected inspector"
      toast.success(`${result.count} job(s) moved from ${actionMember.name} to ${targetName}`)
      await reload()
      setReassignOpen(false)
      setActionMember(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<StaffMember>[] = [
    { key: "name", header: "Name", cell: (row) => row.name },
    { key: "email", header: "Email", cell: (row) => row.email },
    {
      key: "phone",
      header: "Phone",
      cell: (row) => row.profile?.phone || "—",
    },
    {
      key: "role",
      header: "Role",
      cell: () => "Inspector",
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={statusVariant(row.status)} label={row.status} />,
    },
    {
      key: "assigned",
      header: "Jobs assigned",
      cell: (row) => String(row.jobsAssigned ?? 0),
      className: "text-right",
    },
    {
      key: "completed",
      header: "Jobs completed",
      cell: (row) => String(row.jobsCompleted ?? 0),
      className: "text-right",
    },
    {
      key: "reports",
      header: "Reports submitted",
      cell: (row) => String(row.reportsSubmitted ?? 0),
      className: "text-right",
    },
    {
      key: "actions",
      header: "",
      cell: (row) =>
        isAdmin ? (
          <StaffRowActions
            key={row.id}
            member={row}
            onEdit={openEdit}
            onHistory={openHistory}
            onReassign={openReassign}
            onResetPassword={resetPassword}
            onSetStatus={setStatus}
          />
        ) : null,
    },
  ]

  if (isLoading) return <LoadingState label="Loading staff…" />
  if (error) return <ErrorState message={error} />

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Staff"
        description="Create and manage inspectors for your company only."
        actions={
          isAdmin ? (
            <Button onClick={openAdd} className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90">
              <UserPlusIcon data-icon="inline-start" />
              Add inspector
            </Button>
          ) : null
        }
      />

      <DataTable
        columns={columns}
        data={inspectors}
        rowKey={(row) => row.id}
        searchPlaceholder="Search staff…"
        searchKeys={["name", "email"]}
        emptyTitle="No inspectors yet"
        emptyDescription="Add an inspector to assign jobs."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create inspector</DialogTitle>
            <DialogDescription>Name, email, phone, and a temporary password.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Password</Label>
              <PasswordField value={password} onChange={setPassword} autoComplete="new-password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={saveCreate}>
              {saving ? "Saving…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(next) => {
          setEditOpen(next)
          if (!next) setActionMember(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {actionMember?.name || "inspector"}</DialogTitle>
            <DialogDescription>{actionMember?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>New password (optional)</Label>
              <PasswordField value={password} onChange={setPassword} autoComplete="new-password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving || !actionMember} onClick={saveEdit}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={reassignOpen}
        onOpenChange={(next) => {
          setReassignOpen(next)
          if (!next) setActionMember(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign jobs</DialogTitle>
            <DialogDescription>
              Move open jobs from {actionMember?.name} to another inspector.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label>Target inspector</Label>
            <Select
              value={reassignTargetId || null}
              onValueChange={(value) => setReassignTargetId(value || "")}
              items={reassignTargetItems}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reassignTargetItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving || !actionMember || !reassignTargetId} onClick={saveReassign}>
              {saving ? "Reassigning…" : "Reassign jobs"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={historyOpen}
        onOpenChange={(next) => {
          setHistoryOpen(next)
          if (!next) setActionMember(null)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{actionMember?.name} · job history</DialogTitle>
          </DialogHeader>
          <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
            {history.length === 0 ? (
              <li className="text-muted-foreground">No jobs yet.</li>
            ) : (
              history.map((item) => (
                <li key={item.id} className="rounded-md border px-3 py-2">
                  <p className="font-medium">
                    {item.jobNumber} {item.title ? `· ${item.title}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {item.customerName} · {item.status.replaceAll("_", " ")}
                  </p>
                </li>
              ))
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  )
}
