export type Citation = {
  id: string
  code: string
  state: string
  title: string
  body: string
}

export type FeatureFlag = {
  id: string
  name: string
  description: string
  enabled: boolean
  stage: string
}

export type PlatformTemplate = {
  name: string
  intro: string
}
