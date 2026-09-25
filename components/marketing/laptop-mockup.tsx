import Image from "next/image"
import { cn } from "@/lib/utils"

/** Relative key widths per row. */
const keyRows = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.1],
  [1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.2],
  [2.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.7],
  [1.2, 1, 1, 1.2, 5.6, 1.2, 1, 1, 1],
]

export function LaptopMockup({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Laptop showing the RoofClaim company dashboard"
      className={cn("relative mx-auto w-full max-w-[42rem] pb-6", className)}
    >
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[6%] left-[6%] h-[80%] w-[88%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_26%,transparent),transparent_70%)] blur-3xl"
      />

      {/* lid: brushed-metal frame around a dark bezel */}
      <div className="relative rounded-t-[1.3rem] bg-gradient-to-b from-[#e9ecea] via-[#c9cecb] to-[#aeb4b1] p-[2px] shadow-[0_40px_70px_-34px_rgba(6,55,40,0.6)] sm:rounded-t-[1.7rem]">
        <div className="relative rounded-t-[1.2rem] bg-[#0b0d0c] px-[2.4%] pt-[3%] pb-[2.4%] sm:rounded-t-[1.6rem]">
          {/* camera notch */}
          <div
            aria-hidden
            className="absolute top-0 left-1/2 flex h-[1.1%] min-h-[6px] w-[13%] -translate-x-1/2 items-center justify-center rounded-b-lg bg-black"
          >
            <span className="size-[3px] rounded-full bg-[#2b3a35] sm:size-1" />
          </div>

          <div className="relative aspect-[16/9.5] overflow-hidden rounded-[0.3rem] bg-[#f6f8f7] sm:rounded-md">
            <Image
              src="/marketing/company-dashboard.png"
              alt="RoofClaim company dashboard with workspace overview and job statistics"
              width={1489}
              height={711}
              sizes="(max-width: 1024px) 92vw, 42rem"
              className="block h-auto w-full select-none"
            />
            {/* screen glare */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_32%,rgba(255,255,255,0)_70%,rgba(255,255,255,0.08)_100%)]"
            />
          </div>
        </div>
      </div>

      {/* hinge */}
      <div className="relative z-10 mx-[1%] h-[5px] rounded-b-sm bg-gradient-to-b from-[#6f7674] to-[#9aa09d] sm:h-[6px]" />

      {/* keyboard deck, tilted toward the viewer */}
      <div className="relative aspect-[100/17] [perspective:1300px]">
        <div className="absolute inset-x-0 top-0 aspect-[100/34] origin-top [transform:rotateX(58deg)] rounded-b-[1.2rem] bg-gradient-to-b from-[#dfe3e1] via-[#d0d5d2] to-[#bcc2bf] px-[4.5%] pt-[4%] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div className="flex h-[58%] flex-col gap-[2.5px] sm:gap-[3.5px]">
            {keyRows.map((row, r) => (
              <div key={r} className="flex flex-1 gap-[2.5px] sm:gap-[3.5px]">
                {row.map((grow, k) => (
                  <span
                    key={k}
                    className="rounded-[2px] bg-[#1d2120] shadow-[inset_0_-1px_0_rgba(255,255,255,0.08),0_1px_0_rgba(255,255,255,0.5)] sm:rounded-[3px]"
                    style={{ flexGrow: grow, flexBasis: 0 }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mx-auto mt-[4.5%] h-[24%] w-[36%] rounded-md border border-[#a8aeab] bg-gradient-to-b from-[#e8ebe9] to-[#d6dbd8]" />
        </div>
      </div>

      {/* front lip */}
      <div className="relative -mx-[6%] h-2.5 rounded-b-[1.4rem] bg-gradient-to-b from-[#d9ddda] to-[#a4aaa7] shadow-[0_24px_34px_-16px_rgba(6,55,40,0.55)] sm:h-3.5">
        <span
          aria-hidden
          className="absolute top-0 left-1/2 h-1 w-[17%] -translate-x-1/2 rounded-b-xl bg-[#8a908d]/80 sm:h-[6px]"
        />
      </div>

      {/* soft ground shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-0 left-1/2 h-5 w-[86%] -translate-x-1/2 rounded-[100%] bg-primary-dark/25 blur-xl"
      />
    </div>
  )
}
