"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      duration={4000}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--success-bg": "color-mix(in oklab, var(--success) 12%, var(--popover))",
          "--success-text": "var(--foreground)",
          "--success-border": "color-mix(in oklab, var(--success) 35%, var(--border))",
          "--error-bg": "color-mix(in oklab, var(--danger) 12%, var(--popover))",
          "--error-text": "var(--foreground)",
          "--error-border": "color-mix(in oklab, var(--danger) 35%, var(--border))",
          "--warning-bg": "color-mix(in oklab, var(--warning) 14%, var(--popover))",
          "--warning-text": "var(--foreground)",
          "--warning-border": "color-mix(in oklab, var(--warning) 40%, var(--border))",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          title: "cn-toast-title",
          description: "cn-toast-description",
          closeButton: "cn-toast-close",
          success: "cn-toast-success",
          error: "cn-toast-error",
          warning: "cn-toast-warning",
          info: "cn-toast-info",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
