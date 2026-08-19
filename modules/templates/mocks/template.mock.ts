import type { ChecklistStep, ReportSection, TemplateSet } from "@/modules/templates/types/template.types"

const defaultSections: ReportSection[] = [
  { id: "sec-1", name: "Cover & property details", visible: true, citation: "" },
  { id: "sec-2", name: "Weather verification", visible: true, citation: "NOAA storm verification cross-check" },
  { id: "sec-3", name: "Photo evidence log", visible: true, citation: "" },
  { id: "sec-4", name: "Damage findings", visible: true, citation: "IRC R908.3" },
  { id: "sec-5", name: "Test-square results", visible: true, citation: "Manufacturer hail repair criteria" },
  { id: "sec-6", name: "Code citations", visible: true, citation: "IRC R905.2.6" },
  { id: "sec-7", name: "Adjuster notes", visible: false, citation: "" },
  { id: "sec-8", name: "Recommendation & next steps", visible: true, citation: "" },
]

const defaultChecklist: ChecklistStep[] = [
  { id: "chk-1", title: "Capture elevation and context photos", required: true },
  { id: "chk-2", title: "Record GPS lock before climbing", required: true },
  { id: "chk-3", title: "Photograph each slope overview", required: true },
  { id: "chk-4", title: "Complete test squares on hail-exposed slopes", required: true },
  { id: "chk-5", title: "Document flashing, vents, and penetrations", required: true },
  { id: "chk-6", title: "Tag damage types and counts", required: true },
  { id: "chk-7", title: "Note interior moisture if accessible", required: false },
  { id: "chk-8", title: "Confirm weather event against NOAA data", required: true },
]

let templates: TemplateSet = {
  sections: defaultSections.map((row) => ({ ...row })),
  steps: defaultChecklist.map((row) => ({ ...row })),
}

export function getTemplatesMock(): TemplateSet {
  return {
    sections: templates.sections.map((row) => ({ ...row })),
    steps: templates.steps.map((row) => ({ ...row })),
  }
}

export function saveTemplatesMock(next: TemplateSet): TemplateSet {
  templates = {
    sections: next.sections.map((row) => ({ ...row })),
    steps: next.steps.map((row) => ({ ...row })),
  }
  return getTemplatesMock()
}
