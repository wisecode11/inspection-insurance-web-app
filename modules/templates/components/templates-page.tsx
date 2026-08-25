"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "@/lib/toast"

import { PageHeader } from "@/components/shared/page-header"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ROUTES } from "@/lib/constants/routes"
import { getErrorMessage } from "@/lib/api/errors"
import { useTemplates } from "@/modules/templates/hooks/use-templates"
import { templateService } from "@/modules/templates/services/template.service"
import {
  NARRATIVE_SLOTS,
  type NarrativeSlotKey,
  type ReportSection,
  type ReportTemplate,
} from "@/modules/templates/types/template.types"

function findSection(
  sections: ReportSection[],
  key: NarrativeSlotKey,
  title: string
): ReportSection | undefined {
  return (
    sections.find((row) => row.key === key) ||
    sections.find((row) => row.title.toLowerCase() === title.toLowerCase())
  )
}

function readNarrativeBodies(template: ReportTemplate): Record<NarrativeSlotKey, string> {
  const next = {} as Record<NarrativeSlotKey, string>
  for (const slot of NARRATIVE_SLOTS) {
    next[slot.key] = findSection(template.sections, slot.key, slot.title)?.body || ""
  }
  if (!next.damage_definitions_assessment_criteria.trim() && template.definitions?.trim()) {
    next.damage_definitions_assessment_criteria = template.definitions
  }
  return next
}

function mergeNarrativeIntoSections(
  sections: ReportSection[],
  bodies: Record<NarrativeSlotKey, string>
): ReportSection[] {
  const next = sections.map((section) => ({ ...section }))

  for (const slot of NARRATIVE_SLOTS) {
    const body = bodies[slot.key]
    const existingIndex = next.findIndex(
      (row) =>
        row.key === slot.key || row.title.toLowerCase() === slot.title.toLowerCase()
    )

    if (existingIndex >= 0) {
      next[existingIndex] = {
        ...next[existingIndex],
        key: slot.key,
        title: slot.title,
        body,
        include: true,
      }
      continue
    }

    next.push({
      id: `sec-${slot.key}`,
      key: slot.key,
      title: slot.title,
      include: true,
      sortOrder: next.length,
      body,
    })
  }

  return next.map((section, index) => ({ ...section, sortOrder: index }))
}

export default function TemplatesPage() {
  const { data, isLoading, error, reload } = useTemplates()
  const [template, setTemplate] = React.useState<ReportTemplate | null>(null)
  const [bodies, setBodies] = React.useState<Record<NarrativeSlotKey, string>>({
    summary_of_findings: "",
    investigation_process: "",
    damage_definitions_assessment_criteria: "",
    existing_conditions: "",
  })
  const [legalFooter, setLegalFooter] = React.useState("")
  const [citationIds, setCitationIds] = React.useState<string[]>([])
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!data) return
    const preferred =
      data.templates.find((row) => row.isDefault) || data.templates[0] || null
    if (!preferred) return
    setTemplate(preferred)
    setBodies(readNarrativeBodies(preferred))
    setLegalFooter(preferred.legalFooter || "")
    setCitationIds(preferred.codeCitationIds || [])
  }, [data])

  const citations = data?.citations ?? []

  async function saveTemplate() {
    if (!template) return
    setSaving(true)
    try {
      const sections = mergeNarrativeIntoSections(template.sections, bodies)
      const updated = await templateService.update(template.id, {
        sections,
        legalFooter: legalFooter.trim(),
        definitions: bodies.damage_definitions_assessment_criteria,
        codeCitationIds: citationIds,
        isDefault: true,
      })
      setTemplate(updated)
      setBodies(readNarrativeBodies(updated))
      setLegalFooter(updated.legalFooter || "")
      setCitationIds(updated.codeCitationIds || [])
      toast.success("Saved")
      await reload?.()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <LoadingState label="Loading report language…" />
  if (error) return <ErrorState message={error} />
  if (!template) {
    return <ErrorState message="No report language defaults found." />
  }

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Report language"
        description="Default wording used in evidence package PDFs."
        actions={
          <Button
            className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
            disabled={saving}
            onClick={saveTemplate}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        {NARRATIVE_SLOTS.map((slot) => (
          <Card key={slot.key}>
            <CardHeader className="pb-3">
              <CardTitle>{slot.title}</CardTitle>
              {slot.hint ? (
                <p className="text-xs text-muted-foreground">{slot.hint}</p>
              ) : null}
            </CardHeader>
            <CardContent>
              <Textarea
                rows={slot.key === "damage_definitions_assessment_criteria" ? 6 : 4}
                value={bodies[slot.key]}
                onChange={(e) =>
                  setBodies((current) => ({ ...current, [slot.key]: e.target.value }))
                }
              />
            </CardContent>
          </Card>
        ))}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                value={legalFooter}
                onChange={(e) => setLegalFooter(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Codes &amp; standards</CardTitle>
              <p className="text-xs text-muted-foreground">
                Manage citations in{" "}
                <Link href={ROUTES.company.codes} className="underline underline-offset-2">
                  Codes &amp; standards
                </Link>
                .
              </p>
            </CardHeader>
            <CardContent className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto">
              {citations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No citations yet.</p>
              ) : (
                citations.map((citation) => {
                  const checked = citationIds.includes(citation.id)
                  return (
                    <label
                      key={citation.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => {
                          const next = Boolean(value)
                          setCitationIds((current) =>
                            next
                              ? [...current, citation.id]
                              : current.filter((id) => id !== citation.id)
                          )
                        }}
                      />
                      <span className="min-w-0 flex-1 text-sm font-medium">
                        {citation.state} {citation.code} — {citation.title}
                      </span>
                    </label>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
