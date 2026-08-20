export type DefaultLanguage = {
  roof_damage: string
  hail_damage: string
  wind_damage: string
  missing_shingles: string
  interior_damage: string
}

export type ReportSection = {
  id: string
  key: string
  title: string
  include: boolean
  sortOrder: number
  body: string
}

export type ReportTemplate = {
  id: string
  name: string
  description: string
  version: number
  isDefault: boolean
  isActive: boolean
  sections: ReportSection[]
  definitions: string
  legalFooter: string
  defaultLanguage: DefaultLanguage
  codeCitationIds: string[]
  includeWeatherPage: boolean
  includeTestSquares: boolean
  includeCollateral: boolean
  includePhotoIndex: boolean
}

export type ChecklistStep = {
  id: string
  key: string
  label: string
  type: "boolean" | "text" | "number" | "select" | "multiselect" | "photo" | "section"
  required: boolean
  helpText?: string
  sortOrder: number
}

export type ChecklistTemplate = {
  id: string
  name: string
  description: string
  version: number
  isDefault: boolean
  isActive: boolean
  steps: ChecklistStep[]
}

export type CodeCitationOption = {
  id: string
  state: string
  code: string
  title: string
  body: string
  source?: string
  isActive: boolean
}
