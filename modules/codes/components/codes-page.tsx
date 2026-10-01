"use client"

import * as React from "react"
import { MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "@/lib/toast"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { ErrorState, LoadingSkeleton } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { FormDrawer } from "@/components/shared/form-drawer"
import { CardGrid, ViewToggle, useListView } from "@/components/shared/grid-card"
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
import { CitationCard } from "@/modules/codes/components/citation-card"
import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { unwrap } from "@/lib/api/unwrap"
import { getErrorMessage } from "@/lib/api/errors"
import { useAsyncData } from "@/lib/hooks/use-async-data"
import { getStoredUser } from "@/lib/auth/user-storage"

type Citation = {
  id: string
  scope: string
  state: string
  code: string
  title: string
  body: string
  source?: string
  isActive: boolean
}

async function loadCitations() {
  const response = await apiClient.get(endpoints.codes.citations)
  return unwrap<{ citations: Citation[] }>(response.data).citations
}

function stopRowClick(event: React.MouseEvent) {
  event.stopPropagation()
}

export default function CodesPage() {
  const user = getStoredUser()
  const canManage = user?.role === "company_admin"
  const { data = [], isLoading, error, reload } = useAsyncData(loadCitations, "codes")
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Citation | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [state, setState] = React.useState("")
  const [code, setCode] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [body, setBody] = React.useState("")
  const [source, setSource] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)
  const [deleting, setDeleting] = React.useState<Citation | null>(null)
  const [deleteBusy, setDeleteBusy] = React.useState(false)
  const [view, changeView] = useListView("codes:view")

  /** Only company-scoped citations can be changed; the platform library is read-only. */
  function canEdit(citation: Citation) {
    return canManage && citation.scope === "tenant"
  }

  function openCreate() {
    setEditing(null)
    setState("")
    setCode("")
    setTitle("")
    setBody("")
    setSource("")
    setIsActive(true)
    setOpen(true)
  }

  function openEdit(citation: Citation) {
    setEditing(citation)
    setState(citation.state)
    setCode(citation.code)
    setTitle(citation.title)
    setBody(citation.body)
    setSource(citation.source || "")
    setIsActive(citation.isActive)
    setOpen(true)
  }

  async function saveCitation() {
    if (!state.trim() || !code.trim() || !title.trim() || !body.trim()) {
      toast.error("State, code, title, and body are required")
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await apiClient.patch(endpoints.codes.citation(editing.id), {
          state: state.trim(),
          code: code.trim(),
          title: title.trim(),
          body: body.trim(),
          source: source.trim(),
          isActive,
        })
        toast.success("Code citation updated")
      } else {
        await apiClient.post(endpoints.codes.citations, {
          state: state.trim(),
          code: code.trim(),
          title: title.trim(),
          body: body.trim(),
          source: source.trim() || undefined,
          isActive,
        })
        toast.success("Code citation created")
      }
      await reload()
      setOpen(false)
      setEditing(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    try {
      await apiClient.delete(endpoints.codes.citation(deleting.id))
      toast.success("Code citation deleted")
      setDeleting(null)
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleteBusy(false)
    }
  }

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} />

  function renderActions(citation: Citation) {
    if (!canEdit(citation)) return null
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${citation.code}`}>
              <MoreHorizontalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>{citation.code}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openEdit(citation)}>
              <PencilIcon />
              Edit citation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(citation)}>
              <Trash2Icon />
              Delete citation
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const columns: Column<Citation>[] = [
    {
      key: "state",
      header: "State",
      sortable: true,
      accessor: (row) => row.state,
    },
    {
      key: "code",
      header: "Code",
      sortable: true,
      accessor: (row) => row.code,
      cell: (row) => <span className="font-medium">{row.code}</span>,
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      accessor: (row) => row.title,
    },
    {
      key: "scope",
      header: "Scope",
      sortable: true,
      accessor: (row) => row.scope,
      cell: (row) => (row.scope === "tenant" ? "Company" : "Platform"),
    },
    ...(canManage
      ? [
          {
            key: "actions",
            header: "",
            className: "w-[1%] whitespace-nowrap",
            cell: (row: Citation) => <div onClick={stopRowClick}>{renderActions(row)}</div>,
          },
        ]
      : []),
  ]

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Codes & standards"
        description="Configure building-code citations used in inspection reports for your company."
        actions={
          canManage ? (
            <Button variant="default" onClick={openCreate}>
              <PlusIcon data-icon="inline-start" />
              Add citation
            </Button>
          ) : null
        }
      />

      <DataTable
        data={data}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search codes…"
        searchKeys={["state", "code", "title", "body"]}
        pageSize={view === "grid" ? 12 : 8}
        toolbar={<ViewToggle view={view} onChange={changeView} />}
        renderGrid={
          view === "grid"
            ? (citations) => (
                <CardGrid>
                  {citations.map((citation) => (
                    <CitationCard
                      key={citation.id}
                      citation={citation}
                      actions={renderActions(citation)}
                    />
                  ))}
                </CardGrid>
              )
            : undefined
        }
        emptyTitle="No citations yet"
        emptyDescription="Add company-specific code citations, or rely on the platform library."
        emptyIcon3d="clipboard"
      />

      <FormDrawer
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setEditing(null)
        }}
        title={editing ? `Edit ${editing.code}` : "Add code citation"}
        description={
          editing
            ? "Changes apply to reports generated from now on."
            : "Company-scoped citations appear alongside the platform library."
        }
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveCitation} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create"}
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>State</Label>
            <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="TX" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="IRC R908.3" />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Body</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Source</Label>
            <Input value={source} onChange={(e) => setSource(e.target.value)} />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5 sm:col-span-2">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="citation-active">Active</Label>
              <p className="text-xs text-muted-foreground">
                Inactive citations stay saved but aren&apos;t offered in reports.
              </p>
            </div>
            <Switch
              id="citation-active"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(Boolean(checked))}
            />
          </div>
        </div>
      </FormDrawer>

      <Dialog
        open={!!deleting}
        onOpenChange={(next) => {
          if (!next && !deleteBusy) setDeleting(null)
        }}
      >
        <DialogContent showCloseButton={!deleteBusy}>
          <DialogHeader>
            <DialogTitle>Delete citation?</DialogTitle>
            <DialogDescription>
              {deleting
                ? `${deleting.code} — ${deleting.title} will be removed from your company's codes and won't be offered in new reports.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={deleteBusy} onClick={() => setDeleting(null)}>
              Keep citation
            </Button>
            <Button variant="destructive" disabled={deleteBusy} onClick={() => void confirmDelete()}>
              {deleteBusy ? "Deleting…" : "Delete citation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
