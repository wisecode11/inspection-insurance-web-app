"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  CameraIcon,
  FileDownIcon,
  MapPinIcon,
  Share2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { StormBadge } from "@/components/shared/storm-badge"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ROUTES } from "@/lib/constants/routes"
import { useInspection } from "@/modules/inspections/hooks/use-inspections"
import { inspectionService } from "@/modules/inspections/services/inspection.service"
import type { DamageTag, PhotoEvidence, TestSquare } from "@/modules/inspections/types/inspection.types"
import { cn } from "@/lib/utils"

const severityLabel = {
  minor: "Minor",
  moderate: "Moderate",
  severe: "Severe",
} as const

export default function InspectionDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { data: inspection, isLoading, error } = useInspection(params.id)
  const [photos, setPhotos] = React.useState<PhotoEvidence[]>([])
  const [tags, setTags] = React.useState<DamageTag[]>([])
  const [squares, setSquares] = React.useState<TestSquare[]>([])

  React.useEffect(() => {
    if (!inspection) return
    void Promise.all([
      inspectionService.photos(inspection),
      inspectionService.damageTags(inspection),
      inspectionService.testSquares(inspection),
    ]).then(([nextPhotos, nextTags, nextSquares]) => {
      setPhotos(nextPhotos)
      setTags(nextTags)
      setSquares(nextSquares)
    })
  }, [inspection])

  if (isLoading) return <LoadingState label="Loading report…" />
  if (error) return <ErrorState message={error} />

  if (!inspection) {
    return (
      <Empty className="border py-20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CameraIcon />
          </EmptyMedia>
          <EmptyTitle>Report not found</EmptyTitle>
          <EmptyDescription>That inspection id is not in this company workspace.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => router.push(ROUTES.company.jobs)}>
            Back to jobs
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Jobs & reports"
        title={inspection.address}
        description={`${inspection.city} · ${inspection.inspector} · ${inspection.date}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => router.push(ROUTES.company.jobs)}>
              <ArrowLeftIcon data-icon="inline-start" />
              Back
            </Button>
            <Button
              variant="outline"
              disabled={inspection.status === "approved"}
              onClick={async () => {
                await inspectionService.approve(inspection.id)
                toast.success(`Report ${inspection.id} approved`)
              }}
            >
              Approve
            </Button>
            <Button variant="outline" onClick={() => toast.message("Share link copied")}>
              <Share2Icon data-icon="inline-start" />
              Share
            </Button>
            <Button
              className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90"
              onClick={() => toast.success("PDF export started")}
            >
              <FileDownIcon data-icon="inline-start" />
              Export PDF
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={inspection.status} />
        <StatusBadge status={inspection.claimStatus} label={`Claim ${inspection.claimStatus}`} />
        <StormBadge state={inspection.weather} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photo evidence</CardTitle>
          <CardDescription>GPS-stamped photos from the inspection. {photos.length} shown.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {photos.map((photo, index) => (
              <figure key={photo.id} className="overflow-hidden rounded-lg border bg-card">
                <div
                  className={cn(
                    "relative flex aspect-[4/3] items-center justify-center",
                    index % 3 === 0 && "bg-primary/10",
                    index % 3 === 1 && "bg-terracotta/10",
                    index % 3 === 2 && "bg-muted",
                  )}
                >
                  <CameraIcon className="size-8 text-muted-foreground/70" />
                  <span className="absolute top-2 left-2 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-medium">
                    {photo.slope}
                  </span>
                </div>
                <figcaption className="flex flex-col gap-1 p-3">
                  <p className="text-sm font-medium">{photo.label}</p>
                  <p className="flex items-start gap-1 text-xs text-muted-foreground">
                    <MapPinIcon className="mt-0.5 size-3 shrink-0" />
                    {photo.gps}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">{photo.timestamp}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Damage tags</CardTitle>
            <CardDescription>Tagged findings from the field inspection</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium">{tag.type}</span>
                  <span className="text-xs text-muted-foreground">{tag.area}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={tag.severity === "severe" ? "failed" : tag.severity === "moderate" ? "pending" : "draft"}
                    label={severityLabel[tag.severity]}
                    withDot={false}
                  />
                  <span className="w-8 text-right text-sm font-semibold tabular-nums">{tag.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test-square results</CardTitle>
            <CardDescription>Hail-hit counts against the 10×10 repair threshold</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {squares.map((square) => {
              const qualifies = square.hits >= square.threshold
              return (
                <div key={square.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium">{square.label}</span>
                    <span className="text-xs text-muted-foreground">{square.slope}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm tabular-nums">
                      {square.hits} / {square.threshold}
                    </span>
                    <StatusBadge status={qualifies ? "approved" : "pending"} label={qualifies ? "Meets threshold" : "Below threshold"} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
