export type ClaimStatus = "approved" | "pending" | "submitted" | "draft" | "failed"

export type Inspection = {
  id: string
  address: string
  city: string
  inspector: string
  date: string
  status: "draft" | "submitted" | "approved"
  claimStatus: ClaimStatus
  weather: "verified" | "mismatch"
  photos: number
  damageTags: number
  testSquares: number
}

export type PhotoEvidence = {
  id: string
  label: string
  slope: string
  gps: string
  timestamp: string
}

export type DamageTag = {
  id: string
  area: string
  type: string
  severity: "minor" | "moderate" | "severe"
  count: number
}

export type TestSquare = {
  id: string
  label: string
  slope: string
  hits: number
  threshold: number
}
