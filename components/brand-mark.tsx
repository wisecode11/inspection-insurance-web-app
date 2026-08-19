import Link from "next/link"
import { ShieldIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function BrandMark({
  href = "/",
  subtitle,
  className,
  onDark = false,
}: {
  href?: string
  subtitle?: string
  className?: string
  onDark?: boolean
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          onDark ? "bg-terracotta text-terracotta-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        <ShieldIcon className="size-5" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className={cn("text-sm font-semibold tracking-tight", onDark && "text-white")}>
          RoofClaim
        </span>
        {subtitle && (
          <span className={cn("text-xs", onDark ? "text-white/70" : "text-muted-foreground")}>
            {subtitle}
          </span>
        )}
      </span>
    </Link>
  )
}
