"use client"

import Link from "next/link"
import { RefreshCwIcon } from "lucide-react"
import { motion } from "framer-motion"

import { AuditorList, type AuditorRow } from "@/components/company-dashboard/auditor-list"
import { ProgressWidget } from "@/components/company-dashboard/progress-widget"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"

export function AtAGlanceCard({
  percent,
  helper,
  auditors,
}: {
  percent: number
  helper?: string
  auditors?: AuditorRow[]
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex h-full flex-col rounded-[20px] border border-[#E6E9E7] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <div className="flex items-center justify-between border-b border-[#E6E9E7] px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight text-[#101828]">At a glance</h2>
        <button
          type="button"
          aria-label="Refresh"
          className="rounded-lg p-1.5 text-[#667085] transition-colors hover:bg-[#F6F8F7] hover:text-[#101828]"
        >
          <RefreshCwIcon className="size-3.5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-6 px-5 py-5">
        <ProgressWidget percent={percent} helper={helper} />
        <AuditorList auditors={auditors} />
        <Button
          variant="outline"
          className="mt-auto w-full rounded-xl border-[#E6E9E7] bg-[#F6F8F7] text-[#101828] hover:bg-[#EEF1EF]"
          nativeButton={false}
          render={<Link href={ROUTES.company.staff} />}
        >
          Manage team roster
        </Button>
      </div>
    </motion.aside>
  )
}
