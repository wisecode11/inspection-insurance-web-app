"use client"

import Link from "next/link"
import { BellIcon, FileTextIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants/routes"
import { useReportNotifications } from "@/modules/notifications/hooks/use-report-notifications"

export function NotificationBell() {
  const { items, unreadCount, loading, error, open, setOpen, markAllRead, markOneRead } =
    useReportNotifications()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) markAllRead()
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={
              unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
            }
            className="relative size-9 shrink-0 text-white hover:bg-white/10 hover:text-white"
          >
            <BellIcon className="size-[18px]" />
            {unreadCount > 0 ? (
              <span className="absolute top-0.5 right-0.5 flex size-4 min-w-4 items-center justify-center rounded-full bg-white px-0.5 text-[10px] font-bold leading-none text-primary">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </Button>
        }
      />

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={10}
        className="w-[min(22rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-2xl p-0"
      >
        <PopoverHeader className="border-b border-border px-4 py-3">
          <PopoverTitle className="text-base">Notifications</PopoverTitle>
          <p className="text-xs text-muted-foreground">
            Reports waiting for your review
          </p>
        </PopoverHeader>

        <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
          {loading ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : error ? (
            <p className="px-4 py-6 text-center text-sm text-destructive">{error}</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary-tint text-primary">
                <BellIcon className="size-5" />
              </div>
              <p className="text-sm font-medium text-foreground">No new reports</p>
              <p className="text-xs text-muted-foreground">
                When an inspector submits a report, you&apos;ll see it here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      markOneRead(item.reportId)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex gap-3 px-4 py-3 transition-colors hover:bg-primary-tint/50",
                      item.unread && "bg-primary-tint/30",
                    )}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <FileTextIcon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        {item.unread ? (
                          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                        {item.message}
                      </span>
                      {item.time ? (
                        <span className="mt-1 block text-[11px] text-muted-foreground/80">
                          {item.time}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-border px-4 py-2.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full text-primary"
              nativeButton={false}
              render={<Link href={ROUTES.company.reports} onClick={() => setOpen(false)} />}
            >
              View all reports
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
