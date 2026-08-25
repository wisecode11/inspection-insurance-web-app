import { toast as sonner } from "sonner"

/**
 * Single toast API for admin platform action feedback.
 * Prefer this over importing `sonner` directly.
 */
export const appToast = {
  success: (message: string) => sonner.success(message),
  error: (message: string) => sonner.error(message),
  info: (message: string, description?: string) =>
    description ? sonner.message(message, { description }) : sonner.message(message),
}

/** Alias for call sites that prefer `toast.success` naming. */
export const toast = appToast
