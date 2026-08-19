"use client"

import * as React from "react"
import { GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTemplates } from "@/modules/templates/hooks/use-templates"
import { templateService } from "@/modules/templates/services/template.service"
import type { ChecklistStep } from "@/modules/templates/types/template.types"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { cn } from "@/lib/utils"

function reorder<T>(list: T[], from: number, to: number) {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export default function TemplatesPage() {
  const { data, isLoading, error } = useTemplates()
  const [sections, setSections] = React.useState(data?.sections ?? [])
  const [selectedId, setSelectedId] = React.useState(data?.sections[0]?.id ?? "")
  const [steps, setSteps] = React.useState(data?.steps ?? [])
  const dragIndex = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!data) return
    setSections(data.sections)
    setSteps(data.steps)
    setSelectedId((current) => current || data.sections[0]?.id || "")
  }, [data])

  if (isLoading) return <LoadingState label="Loading templates…" />
  if (error) return <ErrorState message={error} />

  const selected = sections.find((s) => s.id === selectedId) ?? sections[0]

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

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Templates & checklists"
        description="Reorder report sections, attach code citations, and edit the field checklist."
        actions={
          <Button
            className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
            onClick={async () => {
              await templateService.save({ sections, steps })
              toast.success("Templates saved")
            }}
          >
            Save templates
          </Button>
        }
      />

      <Tabs defaultValue="templates">
        <TabsList variant="line">
          <TabsTrigger value="templates">Report template</TabsTrigger>
          <TabsTrigger value="checklist">Checklist builder</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,18rem)_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Report sections</CardTitle>
                <CardDescription>Drag to reorder how the PDF is assembled.</CardDescription>
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
                    onClick={() => setSelectedId(section.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors",
                      selectedId === section.id
                        ? "border-primary/40 bg-primary/8"
                        : "hover:bg-muted/50",
                      !section.visible && "opacity-60",
                    )}
                  >
                    <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate font-medium">{section.name}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Section configuration</CardTitle>
                <CardDescription>
                  {selected ? `Editing “${selected.name}”` : "Select a section"}
                </CardDescription>
              </CardHeader>
              {selected && (
                <CardContent className="flex max-w-xl flex-col gap-5">
                  <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-3">
                    <div className="flex flex-col gap-0.5">
                      <Label htmlFor="section-visible">Visible in report</Label>
                      <p className="text-xs text-muted-foreground">Hidden sections are omitted from PDF export.</p>
                    </div>
                    <Switch
                      id="section-visible"
                      checked={selected.visible}
                      onCheckedChange={(checked) =>
                        setSections((current) =>
                          current.map((row) =>
                            row.id === selected.id ? { ...row, visible: checked } : row,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="citation">State code citation</Label>
                    <Input
                      id="citation"
                      value={selected.citation}
                      placeholder="e.g. IRC R908.3"
                      onChange={(e) =>
                        setSections((current) =>
                          current.map((row) =>
                            row.id === selected.id ? { ...row, citation: e.target.value } : row,
                          ),
                        )
                      }
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inspection steps</CardTitle>
              <CardDescription>Drag to reorder the checklist inspectors follow on site.</CardDescription>
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
                  className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                >
                  <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    value={step.title}
                    onChange={(e) =>
                      setSteps((current) =>
                        current.map((row) =>
                          row.id === step.id ? { ...row, title: e.target.value } : row,
                        ),
                      )
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`req-${step.id}`} className="hidden text-xs text-muted-foreground sm:inline">
                      Required
                    </Label>
                    <Switch
                      id={`req-${step.id}`}
                      checked={step.required}
                      onCheckedChange={(checked) =>
                        setSteps((current) =>
                          current.map((row) =>
                            row.id === step.id ? { ...row, required: checked } : row,
                          ),
                        )
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove step"
                    onClick={() => setSteps((current) => current.filter((row) => row.id !== step.id))}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="mt-2 w-fit"
                onClick={() =>
                  setSteps((current) => [
                    ...current,
                    {
                      id: `chk-${Date.now()}`,
                      title: "New inspection step",
                      required: false,
                    } satisfies ChecklistStep,
                  ])
                }
              >
                <PlusIcon data-icon="inline-start" />
                Add step
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
