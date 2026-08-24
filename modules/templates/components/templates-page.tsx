"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  // Prefer dedicated definitions field when the damage-definitions section body is empty.
  if (!next.damage_definitions_assessment_criteria.trim() && template.definitions?.trim()) {
    next.damage_definitions_assessment_criteria = template.definitions
  }
  return next
}

/** Merge admin narrative edits into the full section list without touching photo/layout sections. */
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
    return <ErrorState message="No company report language defaults found." />
  }

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Report language"
        description="Company-wide default wording for evidence packages. Inspectors can override narrative text on a single report; Codes & Standards stay admin-only."
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
            <CardHeader>
              <CardTitle>{slot.title}</CardTitle>
              <CardDescription>{slot.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={slot.key === "damage_definitions_assessment_criteria" ? 6 : 4}
                value={bodies[slot.key]}
                placeholder={slot.placeholder}
                onChange={(e) =>
                  setBodies((current) => ({ ...current, [slot.key]: e.target.value }))
                }
              />
            </CardContent>
          </Card>
        ))}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Disclaimer</CardTitle>
              <CardDescription>Shown near the end of the evidence package.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                value={legalFooter}
                onChange={(e) => setLegalFooter(e.target.value)}
                placeholder="Disclaimer…"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Codes &amp; Standards citations</CardTitle>
              <CardDescription>
                Choose which citations from{" "}
                <Link href={ROUTES.company.codes} className="underline underline-offset-2">
                  Codes &amp; standards
                </Link>{" "}
                appear in every report. Inspectors cannot edit this section.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto">
              {citations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No citations yet. Add them under Codes &amp; standards.
                </p>
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
