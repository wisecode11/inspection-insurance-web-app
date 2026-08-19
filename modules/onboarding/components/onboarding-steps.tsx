"use client"

import { cn } from "@/lib/utils"

const steps = [
  { id: "account", label: "Account" },
  { id: "organization", label: "Organization" },
  { id: "plan", label: "Plan" },
] as const

export function OnboardingSteps({ current }: { current: "organization" | "plan" }) {
  const activeIndex = current === "organization" ? 1 : 2

  return (
    <ol className="mb-8 flex items-center gap-2 text-xs font-medium">
      {steps.map((step, index) => {
        const done = index < activeIndex
        const active = index === activeIndex
        return (
          <li key={step.id} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full",
                done || active
                  ? "bg-terracotta text-terracotta-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {index + 1}
            </span>
            <span className={cn(active || done ? "text-foreground" : "text-muted-foreground")}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span className={cn("h-px flex-1", done ? "bg-terracotta" : "bg-border")} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
