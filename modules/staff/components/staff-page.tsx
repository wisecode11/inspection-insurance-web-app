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

export default function StaffPage() {
  const user = getStoredUser()
  const isAdmin = user?.role === "company_admin"
  const { data: inspectors = [], isLoading, error, reload } = useStaff()

  const [open, setOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const [reassignOpen, setReassignOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [editing, setEditing] = React.useState<StaffMember | null>(null)
  const [history, setHistory] = React.useState<InspectorHistoryItem[]>([])
  const [reassignTargetId, setReassignTargetId] = React.useState("")
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [password, setPassword] = React.useState("")

  function resetForm() {
    setName("")
    setEmail("")
    setPhone("")
    setPassword("")
    setEditing(null)
  }

  function openAdd() {
    resetForm()
    setOpen(true)
  }

  function openEdit(member: StaffMember) {
    setEditing(member)
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
    if (!editing) return
    setSaving(true)
    try {
      await staffService.update(editing.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        password: password.trim() || undefined,
      })
      toast.success("Inspector updated")
      await reload()
      setEditOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function setStatus(member: StaffMember, status: "active" | "suspended" | "deactivated") {
    try {
      await staffService.setStatus(member.id, status)
      toast.success(`Inspector ${status}`)
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
          ? "Password reset emailed to inspector"
          : `Temporary password: ${result.temporaryPassword}`,
      )
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function openHistory(member: StaffMember) {
    try {
      const result = await staffService.history(member.id)
      setEditing(member)
      setHistory(result.history)
      setHistoryOpen(true)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  function openReassign(member: StaffMember) {
    setEditing(member)
    setReassignTargetId(inspectors.find((item) => item.id !== member.id && item.status === "active")?.id || "")
    setReassignOpen(true)
  }

  async function saveReassign() {
    if (!editing || !reassignTargetId) {
      toast.error("Select a target inspector")
      return
    }
    setSaving(true)
    try {
      const result = await staffService.reassignJobs(editing.id, reassignTargetId)
      toast.success(`${result.count} job(s) reassigned`)
      await reload()
      setReassignOpen(false)
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
      key: "productivity",
      header: "Productivity",
      cell: (row) => `${row.productivity?.completionRate ?? 0}%`,
      className: "text-right",
    },
    {
      key: "actions",
      header: "",
      cell: (row) =>
        isAdmin ? (
          <div onClick={stopRowClick}>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontalIcon />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => openEdit(row)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openHistory(row)}>Job history</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openReassign(row)}>Reassign jobs</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => resetPassword(row)}>Reset password</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {row.status === "active" ? (
                    <DropdownMenuItem onClick={() => setStatus(row, "suspended")}>
                      Suspend
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => setStatus(row, "active")}>
                      Activate
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem variant="destructive" onClick={() => setStatus(row, "deactivated")}>
                    Deactivate
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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

      <DataTable columns={columns} data={inspectors} emptyMessage="No inspectors yet." />

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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit inspector</DialogTitle>
            <DialogDescription>{editing?.email}</DialogDescription>
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
            <Button disabled={saving} onClick={saveEdit}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign jobs</DialogTitle>
            <DialogDescription>
              Move open jobs from {editing?.name} to another inspector.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label>Target inspector</Label>
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={reassignTargetId}
              onChange={(e) => setReassignTargetId(e.target.value)}
            >
              <option value="">Select inspector</option>
              {inspectors
                .filter((item) => item.id !== editing?.id && item.status === "active")
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={saveReassign}>
              {saving ? "Reassigning…" : "Reassign jobs"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.name} · job history</DialogTitle>
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
