"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"

type ToastContextType = ReturnType<typeof useToast>

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Fix the ToastProvider to prevent potential issues with context updates
export function ToastProvider({ children }: { children: ReactNode }) {
  const toastData = useToast()

  return (
    <ToastContext.Provider value={toastData}>
      {children}
      <ToastContainer toasts={toastData.toasts} dismissToast={toastData.dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider")
  }
  return context
}
