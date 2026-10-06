"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { LockKeyholeIcon, MailIcon, UserRoundIcon } from "lucide-react"

import { useAuthScene } from "@/components/auth/auth-scene-context"
import { env } from "@/lib/config/env"
import { cn } from "@/lib/utils"
import {
  AuthDivider,
  AuthError,
  AuthFormHeader,
  EMAIL_RE,
  type FieldStatus,
  FloatingField,
  FloatingPassword,
  GlowButton,
  formItem,
  formStagger,
} from "@/modules/auth/components/auth-field"
import { GoogleSignInButton } from "@/modules/auth/components/google-sign-in-button"
import { useSignup } from "@/modules/auth/hooks/use-signup"

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: "", lastName: "" }
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] }
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  }
}

/** 0..4 — length, longer length, mixed case + digits, symbols. Under 6 chars barely counts. */
function passwordStrength(password: string) {
  if (password.length < 6) return password.length ? 0.5 : 0
  let score = 1
  if (password.length >= 10) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const STRENGTH = [
  { label: "Too short", bar: "bg-[#f04438]", text: "text-[#d92d20] dark:text-[#ff7a6b]" },
  { label: "Weak", bar: "bg-[#f79009]", text: "text-[#b54708] dark:text-[#fdb022]" },
  { label: "Fair", bar: "bg-[#eab308]", text: "text-[#a16207] dark:text-[#facc15]" },
  { label: "Good", bar: "bg-[#12b76a]", text: "text-[#067647] dark:text-[#6ae8b0]" },
  { label: "Strong", bar: "bg-gradient-to-r from-[#0f8f5a] to-[#6ae8b0]", text: "text-[#067647] dark:text-[#6ae8b0]" },
]

/** Company admin sign-up form body. Rendered inside the auth experience shell. */
export function SignupForm() {
  const { error, loading, submit, submitGoogle, setError } = useSignup()
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [touched, setTouched] = React.useState({ name: false, email: false, password: false })
  const [attempt, setAttempt] = React.useState(0)

  const showGoogle = Boolean(env.googleClientId)
  const strength = passwordStrength(password)
  const meta = STRENGTH[Math.floor(strength)]

  const nameValid = fullName.trim().length >= 2
  const emailValid = EMAIL_RE.test(email.trim())
  const passwordValid = password.length >= 6

  const status = (valid: boolean, wasTouched: boolean, value: string): FieldStatus =>
    valid ? "valid" : (wasTouched && value) || attempt ? "invalid" : "idle"

  const progress = (nameValid ? 0.25 : 0) + (emailValid ? 0.25 : email.includes("@") ? 0.125 : 0) + (strength / 4) * 0.5
  const sceneHandlers = useAuthScene({ progress, loading, error })

  function clearError() {
    if (error) setError("")
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!nameValid || !emailValid || !passwordValid) {
      setAttempt((n) => n + 1)
      return
    }
    const { firstName, lastName } = splitFullName(fullName)
    await submit({ firstName, lastName, email: email.trim(), password })
  }

  return (
    <motion.form
      noValidate
      onSubmit={handleSubmit}
      variants={formStagger}
      initial="hidden"
      animate="show"
      className="flex flex-col"
      {...sceneHandlers}
    >
      <AuthFormHeader
        title="Create your account"
        description="Set up your admin login. Next you'll name your organization and pick a plan."
      />
      <div className="flex flex-col gap-4">
        <motion.div variants={formItem}>
          <FloatingField
            id="fullName"
            label="Full name"
            icon={UserRoundIcon}
            autoComplete="name"
            value={fullName}
            status={status(nameValid, touched.name, fullName)}
            message="Enter your full name."
            shakeKey={attempt}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            onChange={(event) => {
              setFullName(event.target.value)
              clearError()
            }}
          />
        </motion.div>
        <motion.div variants={formItem}>
          <FloatingField
            id="email"
            label="Work email"
            icon={MailIcon}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            status={status(emailValid, touched.email, email)}
            message={email ? "Enter a valid work email address." : "Your work email is required."}
            shakeKey={attempt}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            onChange={(event) => {
              setEmail(event.target.value)
              clearError()
            }}
          />
        </motion.div>
        <motion.div variants={formItem} className="flex flex-col gap-2.5">
          <FloatingPassword
            id="password"
            label="Password"
            icon={LockKeyholeIcon}
            autoComplete="new-password"
            value={password}
            status={passwordValid ? "idle" : status(false, touched.password, password)}
            message="Use at least 6 characters."
            shakeKey={attempt}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            onChange={(event) => {
              setPassword(event.target.value)
              clearError()
            }}
          />
          <div className="flex items-center gap-3 px-1">
            <div className="flex flex-1 gap-1.5" aria-hidden>
              {Array.from({ length: 4 }, (_, i) => (
                <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/10">
                  <motion.span
                    className={cn("block h-full rounded-full", meta.bar)}
                    initial={false}
                    animate={{ width: `${Math.min(1, Math.max(0, strength - i)) * 100}%` }}
                    transition={{ type: "spring", stiffness: 160, damping: 22 }}
                  />
                </span>
              ))}
            </div>
            <span
              aria-live="polite"
              className={cn(
                "w-16 text-right text-[11px] font-semibold transition-colors",
                password ? meta.text : "text-muted-foreground",
              )}
            >
              {password ? meta.label : "Strength"}
            </span>
          </div>
        </motion.div>
        <AnimatePresence>
          {error && (
            <AuthError title="Couldn't create your account">
              {error}
              {/already registered|already exists|409/i.test(error) ? (
                <>
                  {" "}
                  <Link href="/login" className="font-semibold underline underline-offset-2">
                    Sign in instead
                  </Link>
                </>
              ) : null}
            </AuthError>
          )}
        </AnimatePresence>
        <motion.div variants={formItem} className="pt-1">
          <GlowButton loading={loading} loadingLabel="Creating your workspace…">
            Create account
          </GlowButton>
        </motion.div>
        {showGoogle ? (
          <motion.div variants={formItem} className="flex flex-col gap-4 pt-1">
            <AuthDivider label="or" />
            <GoogleSignInButton disabled={loading} onCredential={submitGoogle} onError={setError} />
          </motion.div>
        ) : null}
      </div>
      <motion.p variants={formItem} className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#0a4b37] underline-offset-4 transition-colors hover:text-[#0f8f5a] hover:underline dark:text-[#6ae8b0]"
        >
          Sign in
        </Link>
      </motion.p>
    </motion.form>
  )
}
