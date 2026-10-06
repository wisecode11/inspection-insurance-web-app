"use client"

import * as React from "react"
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion"
import { AlertCircleIcon, ArrowRightIcon, CheckIcon, EyeIcon, EyeOffIcon, Loader2Icon, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type FieldStatus = "idle" | "valid" | "invalid"

type FloatingFieldProps = Omit<React.ComponentProps<"input">, "placeholder"> & {
  id: string
  label: string
  icon: LucideIcon
  status?: FieldStatus
  /** Shown under the field while status is "invalid". */
  message?: string
  /** Bump to replay the shake (e.g. on a failed submit). */
  shakeKey?: number
  trailing?: React.ReactNode
}

/**
 * Floating-label input: the label rides up on focus/fill, a gradient
 * ring glows on focus, a check pops in when valid, and invalid fields
 * shake once and slide their message in.
 */
export function FloatingField({
  id,
  label,
  icon: Icon,
  status = "idle",
  message,
  shakeKey = 0,
  trailing,
  className,
  ...inputProps
}: FloatingFieldProps) {
  const shellRef = React.useRef<HTMLDivElement>(null)
  const messageId = `${id}-message`
  const invalid = status === "invalid"

  React.useEffect(() => {
    const el = shellRef.current
    if (!el || !shakeKey || !invalid) return
    el.classList.remove("auth-input-shake")
    void el.offsetWidth // restart the animation
    el.classList.add("auth-input-shake")
  }, [shakeKey, invalid])

  return (
    <div className="flex flex-col">
      <div ref={shellRef} className="group relative">
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-px rounded-[17px] opacity-0 transition-opacity duration-300 group-focus-within:opacity-100",
            invalid
              ? "bg-gradient-to-r from-[#f04438] to-[#ff7a6b] opacity-70"
              : "bg-gradient-to-r from-[#0f8f5a] via-[#6ae8b0] to-[#0e7490]",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-1 rounded-[20px] opacity-0 blur-md transition-opacity duration-300 group-focus-within:opacity-40",
            invalid ? "bg-[#f04438]" : "bg-[#12b76a]",
          )}
        />
        <div className="relative">
          <input
            id={id}
            placeholder=" "
            aria-invalid={invalid || undefined}
            aria-describedby={invalid && message ? messageId : undefined}
            className={cn(
              "peer block h-14 w-full rounded-2xl border bg-white/95 pt-5 pr-11 pb-1.5 pl-11 text-[15px] text-foreground outline-none transition-[border-color,background-color] duration-200",
              "border-black/[0.09] hover:border-black/20 focus:border-transparent",
              "dark:border-white/10 dark:bg-[#0d211b] dark:hover:border-white/20 dark:focus:border-transparent",
              invalid && "border-[#f04438]/50",
              trailing && "pr-12",
              className,
            )}
            {...inputProps}
          />
          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute top-1/2 left-11 -translate-y-1/2 text-[15px] text-muted-foreground transition-all duration-200 ease-out",
              "peer-focus:top-[15px] peer-focus:text-[11px] peer-focus:font-medium peer-focus:text-[#0f8f5a] dark:peer-focus:text-[#6ae8b0]",
              "peer-[:not(:placeholder-shown)]:top-[15px] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium",
              invalid && "peer-focus:text-[#f04438] dark:peer-focus:text-[#ff7a6b]",
            )}
          >
            {label}
          </label>
          <Icon
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground transition-colors duration-200",
              invalid
                ? "text-[#f04438]"
                : "group-focus-within:text-[#0f8f5a] dark:group-focus-within:text-[#6ae8b0]",
            )}
          />
          <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center">
            {trailing ?? (
              <AnimatePresence>
                {status === "valid" && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0, rotate: -45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="mr-1.5 flex size-5 items-center justify-center rounded-full bg-[#12b76a] text-white"
                  >
                    <CheckIcon className="size-3" strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {invalid && message && (
          <motion.p
            id={messageId}
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden pt-1.5 pl-1 text-xs font-medium text-[#d92d20] dark:text-[#ff7a6b]"
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Floating password field with a show/hide toggle. */
export function FloatingPassword(props: Omit<FloatingFieldProps, "type" | "trailing">) {
  const [visible, setVisible] = React.useState(false)
  return (
    <FloatingField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={visible ? "off" : "on"}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
            >
              {visible ? <EyeOffIcon className="size-[18px]" /> : <EyeIcon className="size-[18px]" />}
            </motion.span>
          </AnimatePresence>
        </button>
      }
    />
  )
}

type Ripple = { id: number; x: number; y: number; size: number }

/**
 * Primary CTA: gradient that shifts on hover, soft glow, magnetic pull
 * toward the cursor, click ripple, and a shimmering loading state.
 */
export function GlowButton({
  children,
  loading = false,
  loadingLabel,
  disabled,
  type = "submit",
  onClick,
  className,
}: {
  children: React.ReactNode
  loading?: boolean
  loadingLabel?: string
  disabled?: boolean
  type?: "submit" | "button"
  onClick?: () => void
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 16, mass: 0.4 })
  const y = useSpring(my, { stiffness: 220, damping: 16, mass: 0.4 })
  const [ripples, setRipples] = React.useState<Ripple[]>([])

  function onPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return
    const rect = event.currentTarget.getBoundingClientRect()
    mx.set(((event.clientX - rect.left) / rect.width - 0.5) * 10)
    my.set(((event.clientY - rect.top) / rect.height - 0.5) * 8)
  }

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (reduceMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const ripple = { id: performance.now(), x: event.clientX - rect.left, y: event.clientY - rect.top, size }
    setRipples((list) => [...list, ripple])
    window.setTimeout(() => setRipples((list) => list.filter((r) => r.id !== ripple.id)), 700)
  }

  return (
    <motion.div style={{ x, y }} className={cn("group/glow relative", className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 -bottom-2 h-8 rounded-full bg-[#12b76a] opacity-40 blur-xl transition-opacity duration-300 group-hover/glow:opacity-70"
      />
      <motion.button
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        onClick={onClick}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          mx.set(0)
          my.set(0)
        }}
        onPointerDown={onPointerDown}
        whileHover={reduceMotion ? undefined : { scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 text-[15px] font-semibold text-white",
          "bg-[linear-gradient(110deg,#063728_0%,#0a4b37_30%,#0f8f5a_65%,#12b76a_100%)] bg-[length:200%_100%] bg-[position:0%_0] transition-[background-position,box-shadow] duration-700 ease-out hover:bg-[position:100%_0]",
          "shadow-[0_16px_36px_-16px_rgba(15,143,90,0.9),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_22px_48px_-14px_rgba(18,183,106,0.95),inset_0_1px_0_rgba(255,255,255,0.3)]",
          "focus-visible:ring-4 focus-visible:ring-[#12b76a]/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-80",
        )}
      >
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            aria-hidden
            className="pointer-events-none absolute rounded-full bg-white/35"
            style={{ left: ripple.x - ripple.size / 2, top: ripple.y - ripple.size / 2, width: ripple.size, height: ripple.size }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
        ))}
        {loading && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            initial={{ left: "-40%" }}
            animate={{ left: "120%" }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={loading ? "loading" : "idle"}
            className="relative flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {loading ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                {loadingLabel ?? children}
              </>
            ) : (
              <>
                {children}
                <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover/glow:translate-x-1" />
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </motion.div>
  )
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
      {label}
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
    </div>
  )
}

/** Stagger used by the auth forms: header, then each field in turn. */
export const formStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

export const formItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

export function AuthFormHeader({ title, description }: { title: string; description: string }) {
  return (
    <motion.div variants={formItem} className="mb-6">
      <h1 className="text-[1.7rem] leading-tight font-semibold tracking-[-0.02em] text-foreground sm:text-[1.9rem]">
        {title}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
    </motion.div>
  )
}

/** Animated error banner for auth forms. */
export function AuthError({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, height: 0, scale: 0.98 }}
      animate={{ opacity: 1, height: "auto", scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="flex gap-2.5 rounded-2xl border border-[#f04438]/25 bg-[#fef3f2]/90 px-3.5 py-3 text-sm text-[#b42318] dark:border-[#ff7a6b]/25 dark:bg-[#ff7a6b]/10 dark:text-[#ffb4a8]">
        <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
        <div>
          {title && <p className="font-semibold">{title}</p>}
          <p className={cn(title && "mt-0.5 opacity-90")}>{children}</p>
        </div>
      </div>
    </motion.div>
  )
}
