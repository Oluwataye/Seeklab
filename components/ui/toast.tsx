"use client"

import { X } from "lucide-react"
import { cva } from "class-variance-authority"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "bg-background border",
        success: "bg-green-50 border-green-200 text-green-800",
        error: "bg-red-50 border-red-200 text-red-800",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
        info: "bg-blue-50 border-blue-200 text-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

interface ToastProps {
  title: string
  description?: string
  variant?: "default" | "success" | "error" | "warning" | "info"
  onDismiss?: () => void
}

export function Toast({ title, description, variant = "default", onDismiss }: ToastProps) {
  return (
    <div className={toastVariants({ variant })}>
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export function ToastContainer({
  toasts,
  dismissToast,
}: {
  toasts: Array<{ id: string; title: string; description?: string; type: string }>
  dismissToast: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-md w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.type as any}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </div>
  )
}
