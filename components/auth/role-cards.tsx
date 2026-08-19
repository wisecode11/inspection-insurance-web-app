"use client"

import { Building2Icon, ShieldIcon, type LucideIcon } from "lucide-react"

import type { Role } from "@/types/role"
import { cn } from "@/lib/utils"

const roles: { id: Role; title: string; hint: string; icon: LucideIcon }[] = [
  { id: "company", title: "Company", hint: "Agency admin", icon: Building2Icon },
  { id: "platform", title: "Platform owner", hint: "Super admin", icon: ShieldIcon },
]

export function RoleCards({
  value,
  onChange,
}: {
  value: Role
  onChange: (role: Role) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {roles.map((role) => {
        const selected = value === role.id
        const Icon = role.icon
        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-center transition-colors",
              selected
                ? "border-terracotta bg-terracotta/10"
                : "border-terracotta/35 hover:border-terracotta hover:bg-terracotta/5",
            )}
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-lg",
                selected ? "bg-terracotta text-terracotta-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="text-sm font-medium">{role.title}</span>
            <span className="text-[11px] text-muted-foreground">{role.hint}</span>
          </button>
        )
      })}
    </div>
  )
}
