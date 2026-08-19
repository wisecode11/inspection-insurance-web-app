export type ReportSection = {
  id: string
  name: string
  visible: boolean
  citation: string
}

export type ChecklistStep = {
  id: string
  title: string
  required: boolean
}

export type TemplateSet = {
  sections: ReportSection[]
  steps: ChecklistStep[]
}
