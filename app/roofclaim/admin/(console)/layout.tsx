import type { ReactNode } from "react"

import { AppShell } from "@/components/layout/app-shell"

export default function SuperAdminConsoleLayout({ children }: { children: ReactNode }) {
  return <AppShell role="platform">{children}</AppShell>
}
