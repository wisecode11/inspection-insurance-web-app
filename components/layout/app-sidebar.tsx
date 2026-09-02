"use client"

import { SidebarNav } from "@/components/layout/sidebar-nav"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useSidebar } from "@/components/ui/sidebar"
import type { Role } from "@/types/role"

/** Desktop sidebar — left rail of the green app frame (shares container corners). */
export function AppSidebarDesktop({ role }: { role: Role }) {
  return (
    <aside
      data-slot="app-sidebar-desktop"
      className="app-sidebar-panel relative hidden h-full w-[var(--app-sidebar-width)] shrink-0 flex-col text-sidebar-foreground md:flex"
    >
      <SidebarNav role={role} />
    </aside>
  )
}

/** Mobile sidebar — slide-over sheet. */
export function AppSidebarMobile({ role }: { role: Role }) {
  const { openMobile, setOpenMobile } = useSidebar()

  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetContent
        side="left"
        className="w-[min(18rem,88vw)] border-none bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <SidebarNav role={role} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
