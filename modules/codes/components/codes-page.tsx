"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "@/lib/toast"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { ErrorState, LoadingSkeleton } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormDrawer } from "@/components/shared/form-drawer"
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

export default function CodesPage() {
  const user = getStoredUser()
  const canManage = user?.role === "company_admin"
  const { data = [], isLoading, error, reload } = useAsyncData(loadCitations, "codes")
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [state, setState] = React.useState("")
  const [code, setCode] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [body, setBody] = React.useState("")
  const [source, setSource] = React.useState("")

  async function createCitation() {
    if (!state.trim() || !code.trim() || !title.trim() || !body.trim()) {
      toast.error("State, code, title, and body are required")
      return
    }
    setSaving(true)
    try {
      await apiClient.post(endpoints.codes.citations, {
        state: state.trim(),
        code: code.trim(),
        title: title.trim(),
        body: body.trim(),
        source: source.trim() || undefined,
      })
      toast.success("Code citation created")
      await reload()
      setOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} />

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
  ]

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Codes & standards"
        description="Configure building-code citations used in inspection reports for your company."
        actions={
          canManage ? (
            <Button
              variant="default"
              onClick={() => {
                setState("")
                setCode("")
                setTitle("")
                setBody("")
                setSource("")
                setOpen(true)
              }}
            >
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
        emptyTitle="No citations yet"
        emptyDescription="Add company-specific code citations, or rely on the platform library."
      />

      <FormDrawer
        open={open}
        onOpenChange={setOpen}
        title="Add code citation"
        description="Company-scoped citations appear alongside the platform library."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={createCitation} disabled={saving}>
              {saving ? "Saving…" : "Create"}
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
        </div>
      </FormDrawer>
    </>
  )
}
