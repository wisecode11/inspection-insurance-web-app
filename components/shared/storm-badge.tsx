import { CircleCheckIcon, TriangleAlertIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function StormBadge({
  state,
  className,
  size = "default",
}: {
  state: "verified" | "mismatch"
  className?: string
  size?: "default" | "sm"
}) {
  const verified = state === "verified"
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        verified
          ? "border-success/20 bg-success/12 text-success"
          : "border-warning/25 bg-warning/14 text-warning",
        className,
      )}
    >
      {verified ? (
        <CircleCheckIcon className={size === "sm" ? "size-3" : "size-4"} />
      ) : (
        <TriangleAlertIcon className={size === "sm" ? "size-3" : "size-4"} />
      )}
      {verified ? "Weather verified" : "Weather mismatch"}
    </span>
  )
}
