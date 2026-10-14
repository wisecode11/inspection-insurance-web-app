"use client"

import * as React from "react"
import Link from "next/link"
import { RefreshCwIcon, UsersIcon } from "lucide-react"
import { motion } from "framer-motion"

import { AuditorList, type AuditorRow } from "@/components/company-dashboard/auditor-list"
import { ProgressWidget } from "@/components/company-dashboard/progress-widget"
import { ROUTES } from "@/lib/constants/routes"

export function AtAGlanceCard({
  percent,
  helper,
  auditors,
  onRefresh,
}: {
  percent: number
  helper?: string
  auditors?: AuditorRow[]
  onRefresh?: () => Promise<unknown> | void
}) {
  const [spins, setSpins] = React.useState(0)
  const [busy, setBusy] = React.useState(false)

  const refresh = async () => {
    setSpins((n) => n + 1)
    if (!onRefresh || busy) return
    setBusy(true)
    try {
      await onRefresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.section
      aria-labelledby="glance-title"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, delay: 0.07, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex h-full min-w-0 flex-col rounded-2xl border border-[rgba(6,55,40,0.10)] bg-white shadow-[0_1px_2px_rgba(6,55,40,0.06),0_1px_3px_rgba(6,55,40,0.05)]"
    >
      <div className="flex items-start justify-between gap-4 px-[22px] pt-5">
        <h3 id="glance-title" className="m-0 text-[17px] font-bold tracking-[-0.01em] text-[#0B1712]">
          At a glance
        </h3>
        <button
          type="button"
          aria-label="Refresh"
          aria-busy={busy}
          onClick={refresh}
          className="grid size-[34px] place-items-center rounded-[10px] border border-[rgba(6,55,40,0.10)] text-[#667085] transition-colors hover:border-[#2FBF6B] hover:text-[#16A34A]"
        >
          <RefreshCwIcon
            className="size-4 transition-transform duration-600 ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{ transform: `rotate(${spins * 360}deg)` }}
          />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-5 px-[22px] pt-[18px] pb-[22px]">
        <ProgressWidget percent={percent} helper={helper} />
        <AuditorList auditors={auditors} />
        <Link
          href={ROUTES.company.staff}
          className="mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[rgba(6,55,40,0.18)] bg-white text-sm font-semibold text-[#0B1712] transition-[transform,border-color] duration-200 hover:-translate-y-px hover:border-[#2FBF6B] active:scale-[0.97]"
        >
          <UsersIcon className="size-4" />
          Manage team roster
        </Link>
      </div>
    </motion.section>
  )
}
