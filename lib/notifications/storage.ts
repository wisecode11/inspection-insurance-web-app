const STORAGE_KEY = "roofclaim:report-notification-read"

function readStore(): Record<string, string[]> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, string[]>
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function writeStore(store: Record<string, string[]>) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function getReadReportIds(userId: string): Set<string> {
  if (!userId) return new Set()
  return new Set(readStore()[userId] ?? [])
}

export function markReportsRead(userId: string, reportIds: string[]) {
  if (!userId || reportIds.length === 0) return
  const store = readStore()
  const existing = new Set(store[userId] ?? [])
  for (const id of reportIds) existing.add(id)
  store[userId] = [...existing]
  writeStore(store)
}
