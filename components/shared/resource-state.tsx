"use client"

import { Loader2Icon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageSkeleton } from "@/components/shared/page-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-2 py-10 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Loader2Icon className="size-4 animate-spin" aria-hidden />
      {label}
    </div>
  )
}

export function LoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return <PageSkeleton rows={rows} />
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Alert variant="destructive" role="alert">
      <AlertTitle>Could not load data</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

/** InlineSkeleton — compact placeholder for cards or table rows. */
export function InlineSkeleton({ className }: { className?: string }) {
  return <Skeleton className={className} />
}
