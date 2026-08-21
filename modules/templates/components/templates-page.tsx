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
  ReportSection,
  ReportTemplate,
} from "@/modules/templates/types/template.types"

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

export default function TemplatesPage() {
  const { data, isLoading, error, reload } = useTemplates()
  const [templates, setTemplates] = React.useState<ReportTemplate[]>([])
  const [checklists, setChecklists] = React.useState<ChecklistTemplate[]>([])
  const [templateId, setTemplateId] = React.useState("")
  const [checklistId, setChecklistId] = React.useState("")
  const [sections, setSections] = React.useState<ReportSection[]>([])
  const [legalFooter, setLegalFooter] = React.useState("")
  const [citationIds, setCitationIds] = React.useState<string[]>([])
  const [templateName, setTemplateName] = React.useState("")
  const [steps, setSteps] = React.useState<ChecklistStep[]>([])
  const [checklistName, setChecklistName] = React.useState("")
  const [savingTemplate, setSavingTemplate] = React.useState(false)
  const [savingChecklist, setSavingChecklist] = React.useState(false)
  const [definitions, setDefinitions] = React.useState("")
  const [defaultLanguage, setDefaultLanguage] = React.useState<ReportTemplate["defaultLanguage"]>({
    roof_damage: "",
    hail_damage: "",
    wind_damage: "",
    missing_shingles: "",
    interior_damage: "",
  })
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
    setLegalFooter(template.legalFooter || "")
    setCitationIds(template.codeCitationIds || [])
    setDefinitions(template.definitions || "")
    setDefaultLanguage(
      template.defaultLanguage || {
        roof_damage: "",
        hail_damage: "",
        wind_damage: "",
        missing_shingles: "",
        interior_damage: "",
      }
    )
  }

  function applyChecklist(checklist: ChecklistTemplate) {
    setChecklistId(checklist.id)
    setChecklistName(checklist.name)
    setSteps(checklist.steps)
  }

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
        name: templateName.trim() || "PDF report",
        sections,
        legalFooter: legalFooter.trim(),
        definitions,
        defaultLanguage,
        codeCitationIds: citationIds,
        isDefault: true,
      })
      setTemplates((current) =>
        current.map((row) => (row.id === updated.id ? updated : { ...row, isDefault: false }))
      )
      applyTemplate(updated)
      toast.success("Saved")
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
        name: `PDF report ${templates.length + 1}`,
        isDefault: false,
      })
      setTemplates((current) => [...current, created])
      applyTemplate(created)
      toast.success("Created")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function saveChecklist() {
    if (!checklistId) return
    setSavingChecklist(true)
    try {
      const updated = await templateService.updateChecklist(checklistId, {
        name: checklistName.trim() || "Inspector form",
        steps,
        isDefault: true,
      })
      setChecklists((current) =>
        current.map((row) => (row.id === updated.id ? updated : { ...row, isDefault: false }))
      )
      applyChecklist(updated)
      toast.success("Saved")
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
        name: `Inspector form ${checklists.length + 1}`,
        isDefault: false,
      })
      setChecklists((current) => [...current, created])
      applyChecklist(created)
      toast.success("Created")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  function addSection() {
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
  }

  function addStep(type: ChecklistStep["type"] = "boolean") {
    const id = `tmp-${Date.now()}`
    setSteps((current) => [
      ...current,
      {
        id,
        key: `step_${current.length + 1}`,
        label: type === "section" ? "New group" : "New question",
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
        description="PDF report sections and inspector form questions."
      />

      <Tabs defaultValue="templates">
        <TabsList variant="line">
          <TabsTrigger value="templates">PDF report</TabsTrigger>
          <TabsTrigger value="checklist">Inspector form</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-[16rem] flex-1 flex-col gap-1.5">
              <Label htmlFor="template-select">Layout</Label>
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
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={createReportTemplate}>
              <PlusIcon data-icon="inline-start" />
              New
            </Button>
            <Button
              className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
              disabled={savingTemplate}
              onClick={saveReportTemplate}
            >
              {savingTemplate ? "Saving…" : "Save"}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sections</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  draggable
                  onDragStart={() => {
                    dragIndex.current = index
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDropSection(index)}
                  className={cn(
                    "rounded-lg border p-3",
                    !section.include && "opacity-60"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" />
                    <Input
                      value={section.title}
                      className="min-w-[12rem] flex-1 font-medium"
                      aria-label="Section title"
                      onChange={(e) =>
                        setSections((current) =>
                          current.map((row) =>
                            row.id === section.id ? { ...row, title: e.target.value } : row
                          )
                        )
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`include-${section.id}`} className="text-xs text-muted-foreground">
                        Include
                      </Label>
                      <Switch
                        id={`include-${section.id}`}
                        checked={section.include}
                        onCheckedChange={(checked) =>
                          setSections((current) =>
                            current.map((row) =>
                              row.id === section.id ? { ...row, include: checked } : row
                            )
                          )
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove section"
                      onClick={() =>
                        setSections((current) => current.filter((row) => row.id !== section.id))
                      }
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                  {section.include && (
                    <Textarea
                      className="mt-3"
                      rows={2}
                      value={section.body}
                      placeholder="Optional text…"
                      onChange={(e) =>
                        setSections((current) =>
                          current.map((row) =>
                            row.id === section.id ? { ...row, body: e.target.value } : row
                          )
                        )
                      }
                    />
                  )}
                </div>
              ))}
              <Button variant="outline" className="w-fit" onClick={addSection}>
                <PlusIcon data-icon="inline-start" />
                Add section
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Disclaimer</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={3}
                  value={legalFooter}
                  onChange={(e) => setLegalFooter(e.target.value)}
                  placeholder="Disclaimer…"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Code citations</CardTitle>
                <CardDescription>
                  From{" "}
                  <Link href={ROUTES.company.codes} className="underline underline-offset-2">
                    Codes & standards
                  </Link>
                </CardDescription>
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
        </TabsContent>

        <TabsContent value="checklist" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex min-w-[16rem] flex-1 flex-col gap-1.5">
              <Label htmlFor="checklist-select">Form</Label>
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
              <Label htmlFor="checklist-name">Form name</Label>
              <Input
                id="checklist-name"
                value={checklistName}
                onChange={(e) => setChecklistName(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={createChecklistTemplate}>
              <PlusIcon data-icon="inline-start" />
              New
            </Button>
            <Button
              className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
              disabled={savingChecklist}
              onClick={saveChecklist}
            >
              {savingChecklist ? "Saving…" : "Save"}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
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
                    aria-label={step.type === "section" ? "Group name" : "Question"}
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
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove"
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
                  Add question
                </Button>
                <Button variant="outline" onClick={() => addStep("section")}>
                  <PlusIcon data-icon="inline-start" />
                  Add group
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
