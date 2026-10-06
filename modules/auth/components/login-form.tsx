"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { LockKeyholeIcon, MailIcon } from "lucide-react"

import { useAuthScene } from "@/components/auth/auth-scene-context"
import { parseRole } from "@/lib/auth/role"
import { env } from "@/lib/config/env"
import {
  AuthDivider,
  AuthError,
  AuthFormHeader,
  EMAIL_RE,
  FloatingField,
  FloatingPassword,
  GlowButton,
  formItem,
  formStagger,
} from "@/modules/auth/components/auth-field"
import { GoogleSignInButton } from "@/modules/auth/components/google-sign-in-button"
import { useLogin } from "@/modules/auth/hooks/use-login"
import type { Role } from "@/types/role"

/** 0..1 — half for the email, half for the password; drives the network scene. */
function credentialProgress(email: string, password: string) {
  const emailScore = EMAIL_RE.test(email.trim()) ? 1 : email.includes("@") ? 0.5 : 0
  return emailScore * 0.5 + Math.min(password.length / 8, 1) * 0.5
}

/** Company sign-in form body. Rendered inside the auth experience shell. */
export function LoginForm() {
  const searchParams = useSearchParams()
  const { error, loading, submit, submitGoogle, setError } = useLogin()
  const [role, setRole] = React.useState<Role>(parseRole(searchParams.get("role")) ?? "company")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [emailTouched, setEmailTouched] = React.useState(false)
  const [attempt, setAttempt] = React.useState(0)

  const showGoogle = role === "company" && Boolean(env.googleClientId)
  const sceneHandlers = useAuthScene({ progress: credentialProgress(email, password), loading, error })

  React.useEffect(() => {
    setRole(parseRole(searchParams.get("role")) ?? "company")
  }, [searchParams])

  const emailValid = EMAIL_RE.test(email.trim())
  const emailStatus = emailValid ? "valid" : (emailTouched && email) || attempt ? "invalid" : "idle"
  const passwordStatus = attempt && !password ? "invalid" : "idle"

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!emailValid || !password) {
      setAttempt((n) => n + 1)
      return
    }
    await submit({ email: email.trim(), password }, "company")
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
        title="Welcome back"
        description="Sign in to your company workspace and pick up every claim where your crew left off."
      />
      <div className="flex flex-col gap-4">
        <motion.div variants={formItem}>
          <FloatingField
            id="email"
            label="Work email"
            icon={MailIcon}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            status={emailStatus}
            message={email ? "Enter a valid work email address." : "Your work email is required."}
            shakeKey={attempt}
            onBlur={() => setEmailTouched(true)}
            onChange={(event) => {
              setEmail(event.target.value)
              if (error) setError("")
            }}
          />
        </motion.div>
        <motion.div variants={formItem}>
          <FloatingPassword
            id="password"
            label="Password"
            icon={LockKeyholeIcon}
            autoComplete="current-password"
            value={password}
            status={passwordStatus}
            message="Enter your password."
            shakeKey={attempt}
            onChange={(event) => {
              setPassword(event.target.value)
              if (error) setError("")
            }}
          />
        </motion.div>
        <AnimatePresence>
          {error && (
            <AuthError title="Couldn't sign you in">
              {error}
              {/no account found|create an account/i.test(error) ? (
                <>
                  {" "}
                  <Link href="/signup" className="font-semibold underline underline-offset-2">
                    Create an account
                  </Link>
                </>
              ) : null}
            </AuthError>
          )}
        </AnimatePresence>
        <motion.div variants={formItem} className="pt-1">
          <GlowButton loading={loading} loadingLabel="Signing you in…">
            Sign in to workspace
          </GlowButton>
        </motion.div>
        {showGoogle ? (
          <motion.div variants={formItem} className="flex flex-col gap-4 pt-1">
            <AuthDivider label="or continue with" />
            <GoogleSignInButton
              disabled={loading}
              onCredential={(idToken) => submitGoogle(idToken, role)}
              onError={setError}
            />
          </motion.div>
        ) : null}
      </div>
      <motion.p variants={formItem} className="mt-6 text-center text-sm text-muted-foreground">
        New to RoofClaim?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[#0a4b37] underline-offset-4 transition-colors hover:text-[#0f8f5a] hover:underline dark:text-[#6ae8b0]"
        >
          Create an account
        </Link>
      </motion.p>
    </motion.form>
  )
}
