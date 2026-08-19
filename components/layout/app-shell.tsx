import type { ReactNode } from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { TopBar } from "@/components/layout/top-bar"
import type { Role } from "@/types/role"

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <SidebarInset>
        <TopBar role={role} />
        <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
