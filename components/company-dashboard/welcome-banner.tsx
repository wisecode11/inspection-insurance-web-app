"use client"

import Link from "next/link"
import { ChevronDownIcon, DownloadIcon, PlusIcon } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"

export function WelcomeBanner({
  greetingName,
  companyName,
}: {
  greetingName: string
  companyName: string
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[20px] border border-[#E6E9E7] bg-white px-6 py-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:min-h-[140px] sm:px-7 sm:py-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 right-0 h-48 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(232,245,239,0.95)_0%,transparent_70%)]"
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-[#063728] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-white uppercase">
              Workspace overview
            </span>
            {/* <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5EF] px-2.5 py-1 text-xs font-medium text-[#027A48]">
              <span className="size-1.5 rounded-full bg-[#12B76A]" />
              Engine Healthy (99.98% uptime)
            </span> */}
          </div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#101828] sm:text-[2rem]">
            Welcome back, {greetingName}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[#667085] sm:text-[15px]">
            {companyName} — real-time operations, distributed job queues, auditor activities and
            telemetry throughput.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="h-10 rounded-full border-[#E6E9E7] bg-white px-4 text-[#344054] hover:bg-[#F6F8F7]"
          >
            Last 7 days
            <ChevronDownIcon data-icon="inline-end" className="size-3.5 opacity-60" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-full border-[#E6E9E7] bg-white px-4 text-[#344054] hover:bg-[#F6F8F7]"
            nativeButton={false}
            render={<Link href={ROUTES.company.analytics} />}
          >
            <DownloadIcon data-icon="inline-start" className="size-3.5" />
            Export Report
          </Button>
          <Button
            size="sm"
            className="h-10 rounded-full bg-[#0F8F5A] px-[18px] text-white hover:bg-[#0d7a4d]"
            nativeButton={false}
            render={<Link href={ROUTES.company.jobs} />}
          >
            <PlusIcon data-icon="inline-start" className="size-3.5" />
            New Job
          </Button>
        </div>
      </div>
    </motion.section>
  )
}
