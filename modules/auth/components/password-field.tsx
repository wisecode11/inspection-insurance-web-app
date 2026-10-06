"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon, type LucideIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function PasswordField({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  className,
  icon: Icon,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  className?: string
  /** Optional leading icon (auth pages). */
  icon?: LucideIcon
}) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="group relative">
      {Icon && (
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary dark:group-focus-within:text-primary-dark" />
      )}
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className={cn("pr-9", className, Icon && "pr-11")}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 rounded-md text-muted-foreground transition-colors hover:text-foreground",
          Icon ? "right-1.5 p-2" : "right-2",
        )}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
      </button>
    </div>
  )
}
