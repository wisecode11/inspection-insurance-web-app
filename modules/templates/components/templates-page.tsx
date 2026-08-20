"use client"

import * as React from "react"
import Link from "next/link"
import { GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ROUTES } from "@/lib/constants/routes"
import { getErrorMessage } from "@/lib/api/errors"
import { cn } from "@/lib/utils"
import { useTemplates } from "@/modules/templates/hooks/use-templates"
import { templateService } from "@/modules/templates/services/template.service"
import type {
  ChecklistStep,
  ChecklistTemplate,
  DefaultLanguage,
  ReportSection,
  ReportTemplate,
} from "@/modules/templates/types/template.types"

const LANGUAGE_FIELDS: { key: keyof DefaultLanguage; label: string }[] = [
  { key: "roof_damage", label: "Roof Damage" },
  { key: "hail_damage", label: "Hail Damage" },
  { key: "wind_damage", label: "Wind Damage" },
  { key: "missing_shingles", label: "Missing Shingles" },
  { key: "interior_damage", label: "Interior Damage" },
]

function reorder<T>(list: T[], from: number, to: number) {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next.map((row, index) =>
    typeof row === "object" && row && "sortOrder" in row
      ? { ...row, sortOrder: index }
      : row
  ) as T[]
}

function emptyLanguage(): DefaultLanguage {
  return {
    roof_damage: "",
    hail_damage: "",
    wind_damage: "",
    missing_shingles: "",
    interior_damage: "",
  }
}

export default function TemplatesPage() {
  const { data, isLoading, error, reload } = useTemplates()
  const [templates, setTemplates] = React.useState<ReportTemplate[]>([])
  const [checklists, setChecklists] = React.useState<ChecklistTemplate[]>([])
  const [templateId, setTemplateId] = React.useState("")
  const [checklistId, setChecklistId] = React.useState("")
  const [sections, setSections] = React.useState<ReportSection[]>([])
  const [selectedSectionId, setSelectedSectionId] = React.useState("")
  const [legalFooter, setLegalFooter] = React.useState("")
  const [definitions, setDefinitions] = React.useState("")
  const [defaultLanguage, setDefaultLanguage] = React.useState<DefaultLanguage>(emptyLanguage())
  const [citationIds, setCitationIds] = React.useState<string[]>([])
  const [templateName, setTemplateName] = React.useState("")
  const [steps, setSteps] = React.useState<ChecklistStep[]>([])
  const [checklistName, setChecklistName] = React.useState("")
  const [savingTemplate, setSavingTemplate] = React.useState(false)
  const [savingChecklist, setSavingChecklist] = React.useState(false)
  const dragIndex = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!data) return
    setTemplates(data.templates)
    setChecklists(data.checklists)
    const preferredTemplate =
      data.templates.find((row) => row.isDefault) || data.templates[0]
    const preferredChecklist =
      data.checklists.find((row) => row.isDefault) || data.checklists[0]
    if (preferredTemplate) applyTemplate(preferredTemplate)
    if (preferredChecklist) applyChecklist(preferredChecklist)
  }, [data])

  function applyTemplate(template: ReportTemplate) {
    setTemplateId(template.id)
    setTemplateName(template.name)
    setSections(template.sections)
    setSelectedSectionId(template.sections[0]?.id || "")
    setLegalFooter(template.legalFooter || "")
    setDefinitions(template.definitions || "")
    setDefaultLanguage(template.defaultLanguage || emptyLanguage())
    setCitationIds(template.codeCitationIds || [])
  }

  function applyChecklist(checklist: ChecklistTemplate) {
    setChecklistId(checklist.id)
    setChecklistName(checklist.name)
    setSteps(checklist.steps)
  }

  const selected = sections.find((s) => s.id === selectedSectionId) ?? sections[0]
  const citations = data?.citations ?? []

  function onDropSection(to: number) {
    const from = dragIndex.current
    dragIndex.current = null
    if (from === null || from === to) return
    setSections((current) => reorder(current, from, to))
  }

  function onDropStep(to: number) {
    const from = dragIndex.current
    dragIndex.current = null
    if (from === null || from === to) return
    setSteps((current) => reorder(current, from, to))
  }

  async function saveReportTemplate() {
    if (!templateId) return
    setSavingTemplate(true)
    try {
      const updated = await templateService.update(templateId, {
        name: templateName.trim() || "Report template",
        sections,
        legalFooter: legalFooter.trim(),
        definitions: definitions.trim(),
        defaultLanguage,
        codeCitationIds: citationIds,
        isDefault: true,
      })
      setTemplates((current) =>
        current.map((row) => (row.id === updated.id ? updated : { ...row, isDefault: false }))
      )
      applyTemplate(updated)
      toast.success("Report template saved — applied to new PDF reports")
      await reload?.()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSavingTemplate(false)
    }
  }

  async function createReportTemplate() {
    try {
      const created = await templateService.create({
        name: `Report template ${templates.length + 1}`,
        isDefault: false,
      })
      setTemplates((current) => [...current, created])
      applyTemplate(created)
      toast.success("Report template created")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function saveChecklist() {
    if (!checklistId) return
    setSavingChecklist(true)
    try {
      const updated = await templateService.updateChecklist(checklistId, {
        name: checklistName.trim() || "Inspection checklist",
        steps,
        isDefault: true,
      })
      setChecklists((current) =>
        current.map((row) => (row.id === updated.id ? updated : { ...row, isDefault: false }))
      )
      applyChecklist(updated)
      toast.success("Checklist saved")
      await reload?.()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSavingChecklist(false)
    }
  }

  async function createChecklistTemplate() {
    try {
      const created = await templateService.createChecklist({
        name: `Inspection checklist ${checklists.length + 1}`,
        isDefault: false,
      })
      setChecklists((current) => [...current, created])
      applyChecklist(created)
      toast.success("Checklist template created")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  function addStep(type: ChecklistStep["type"] = "boolean") {
    const id = `tmp-${Date.now()}`
    setSteps((current) => [
      ...current,
      {
        id,
        key: `step_${current.length + 1}`,
        label: type === "section" ? "New section" : "New inspection step",
        type,
        required: type !== "section",
        sortOrder: current.length,
      },
    ])
  }

  if (isLoading) return <LoadingState label="Loading templates…" />
  if (error) return <ErrorState message={error} />

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Templates & checklists"
        description="Company-wide report defaults, code citations, damage language, and inspection standards."
      />

      <Tabs defaultValue="templates">
        <TabsList variant="line">
          <TabsTrigger value="templates">Report template</TabsTrigger>
          <TabsTrigger value="checklist">Checklist builder</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-[16rem] flex-1 flex-col gap-1.5">
              <Label htmlFor="template-select">Active template</Label>
              <select
                id="template-select"
                className="h-9 rounded-lg border bg-background px-3 text-sm"
                value={templateId}
                onChange={(e) => {
                  const next = templates.find((row) => row.id === e.target.value)
                  if (next) applyTemplate(next)
                }}
              >
                {templates.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                    {row.isDefault ? " (default)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex min-w-[16rem] flex-1 flex-col gap-1.5">
              <Label htmlFor="template-name">Template name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={createReportTemplate}>
              <PlusIcon data-icon="inline-start" />
              New template
            </Button>
            <Button
              className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
              disabled={savingTemplate}
              onClick={saveReportTemplate}
            >
              {savingTemplate ? "Saving…" : "Save report template"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,18rem)_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Sections</CardTitle>
                <CardDescription>Drag to reorder PDF section headings.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    type="button"
                    draggable
                    onDragStart={() => {
                      dragIndex.current = index
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDropSection(index)}
                    onClick={() => setSelectedSectionId(section.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors",
                      selectedSectionId === section.id
                        ? "border-primary/40 bg-primary/8"
                        : "hover:bg-muted/50",
                      !section.include && "opacity-60"
                    )}
                  >
                    <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate font-medium">{section.title}</span>
                  </button>
                ))}
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    const id = `sec-${Date.now()}`
                    setSections((current) => [
                      ...current,
                      {
                        id,
                        key: `section_${current.length + 1}`,
                        title: "New section",
                        include: true,
                        sortOrder: current.length,
                        body: "",
                      },
                    ])
                    setSelectedSectionId(id)
                  }}
                >
                  <PlusIcon data-icon="inline-start" />
                  Add section
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Section configuration</CardTitle>
                <CardDescription>
                  {selected ? `Editing “${selected.title}”` : "Select a section"}
                </CardDescription>
              </CardHeader>
              {selected && (
                <CardContent className="flex max-w-2xl flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="section-title">Heading</Label>
                    <Input
                      id="section-title"
                      value={selected.title}
                      onChange={(e) =>
                        setSections((current) =>
                          current.map((row) =>
                            row.id === selected.id ? { ...row, title: e.target.value } : row
                          )
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-3">
                    <div className="flex flex-col gap-0.5">
                      <Label htmlFor="section-visible">Include in report</Label>
                      <p className="text-xs text-muted-foreground">
                        Hidden sections are omitted from PDF export.
                      </p>
                    </div>
                    <Switch
                      id="section-visible"
                      checked={selected.include}
                      onCheckedChange={(checked) =>
                        setSections((current) =>
                          current.map((row) =>
                            row.id === selected.id ? { ...row, include: checked } : row
                          )
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="section-body">Default content</Label>
                    <Textarea
                      id="section-body"
                      rows={5}
                      value={selected.body}
                      placeholder="Default wording for this section…"
                      onChange={(e) =>
                        setSections((current) =>
                          current.map((row) =>
                            row.id === selected.id ? { ...row, body: e.target.value } : row
                          )
                        )
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    className="w-fit text-destructive"
                    onClick={() => {
                      setSections((current) => current.filter((row) => row.id !== selected.id))
                      setSelectedSectionId("")
                    }}
                  >
                    <Trash2Icon data-icon="inline-start" />
                    Remove section
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Disclaimer text</CardTitle>
                <CardDescription>Legal footer printed on generated PDF reports.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={5}
                  value={legalFooter}
                  onChange={(e) => setLegalFooter(e.target.value)}
                  placeholder="This report reflects conditions observed at the time of inspection…"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Definitions</CardTitle>
                <CardDescription>Optional glossary or terms for inspectors.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={5}
                  value={definitions}
                  onChange={(e) => setDefinitions(e.target.value)}
                  placeholder="Optional definitions…"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Default language</CardTitle>
                <CardDescription>Editable report wording for common damage types.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {LANGUAGE_FIELDS.map((field) => (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Textarea
                      id={field.key}
                      rows={3}
                      value={defaultLanguage[field.key]}
                      onChange={(e) =>
                        setDefaultLanguage((current) => ({
                          ...current,
                          [field.key]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Code citations</CardTitle>
                <CardDescription>
                  Attach state codes and compliance references to this template. Manage the library on{" "}
                  <Link href={ROUTES.company.codes} className="underline underline-offset-2">
                    Codes & standards
                  </Link>
                  .
                </CardDescription>
              </CardHeader>
              <CardContent className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto">
                {citations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No citations yet. Add state-specific codes on Codes & standards.
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
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">
                            {citation.state} {citation.code} — {citation.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">
                            {citation.body}
                          </span>
                        </span>
                      </label>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-[16rem] flex-1 flex-col gap-1.5">
              <Label htmlFor="checklist-select">Checklist template</Label>
              <select
                id="checklist-select"
                className="h-9 rounded-lg border bg-background px-3 text-sm"
                value={checklistId}
                onChange={(e) => {
                  const next = checklists.find((row) => row.id === e.target.value)
                  if (next) applyChecklist(next)
                }}
              >
                {checklists.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                    {row.isDefault ? " (default)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex min-w-[16rem] flex-1 flex-col gap-1.5">
              <Label htmlFor="checklist-name">Template name</Label>
              <Input
                id="checklist-name"
                value={checklistName}
                onChange={(e) => setChecklistName(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={createChecklistTemplate}>
              <PlusIcon data-icon="inline-start" />
              New checklist
            </Button>
            <Button
              className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
              disabled={savingChecklist}
              onClick={saveChecklist}
            >
              {savingChecklist ? "Saving…" : "Save checklist"}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inspection steps</CardTitle>
              <CardDescription>
                Build company inspection standards. Use section headers for Roof, Exterior, and
                Interior groups. Drag to reorder.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  draggable
                  onDragStart={() => {
                    dragIndex.current = index
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDropStep(index)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                    step.type === "section" && "border-primary/30 bg-primary/5"
                  )}
                >
                  <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    value={step.label}
                    className={cn(step.type === "section" && "font-semibold")}
                    onChange={(e) =>
                      setSteps((current) =>
                        current.map((row) =>
                          row.id === step.id ? { ...row, label: e.target.value } : row
                        )
                      )
                    }
                  />
                  {step.type !== "section" && (
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`req-${step.id}`}
                        className="hidden text-xs text-muted-foreground sm:inline"
                      >
                        Required
                      </Label>
                      <Switch
                        id={`req-${step.id}`}
                        checked={step.required}
                        onCheckedChange={(checked) =>
                          setSteps((current) =>
                            current.map((row) =>
                              row.id === step.id ? { ...row, required: checked } : row
                            )
                          )
                        }
                      />
                    </div>
                  )}
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {step.type === "section" ? "Section" : "Step"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove step"
                    onClick={() =>
                      setSteps((current) => current.filter((row) => row.id !== step.id))
                    }
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))}
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => addStep("boolean")}>
                  <PlusIcon data-icon="inline-start" />
                  Add step
                </Button>
                <Button variant="outline" onClick={() => addStep("section")}>
                  <PlusIcon data-icon="inline-start" />
                  Add section header
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
