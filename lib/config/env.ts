function readBool(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback
  return value === "true" || value === "1"
}

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  useMocks: readBool(process.env.NEXT_PUBLIC_USE_MOCKS, true),
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "",
} as const
