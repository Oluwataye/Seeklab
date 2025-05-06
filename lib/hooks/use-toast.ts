"use client"

// This is a simplified toast hook for demonstration purposes
import { useState, useCallback, useMemo } from "react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
}

// Optimize the useToast hook to prevent unnecessary re-renders
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Use useCallback to memoize these functions
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    ({ title, description, type }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, title, description, type }])

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        dismissToast(id)
      }, 5000)
    },
    [dismissToast],
  )

  // Memoize the toast object to prevent unnecessary re-renders
  const toast = useMemo(
    () => ({
      success: (title: string, description?: string) => {
        addToast({ title, description, type: "success" })
      },
      error: (title: string, description?: string) => {
        addToast({ title, description, type: "error" })
      },
      warning: (title: string, description?: string) => {
        addToast({ title, description, type: "warning" })
      },
      info: (title: string, description?: string) => {
        addToast({ title, description, type: "info" })
      },
    }),
    [addToast],
  )

  return {
    toast,
    toasts,
    dismissToast,
  }
}
