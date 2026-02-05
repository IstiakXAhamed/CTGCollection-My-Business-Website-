"use client"

import * as React from "react"

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
  className?: string
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (props: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((props: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...props, id }
    setToasts((prev) => [...prev, newToast])

    // Auto dismiss after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, props.duration || 4000)
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            toast.className ?? (toast.variant === "destructive"
              ? "bg-red-500 text-white"
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700")
          }`}
          onClick={() => dismiss(toast.id)}
        >
          {toast.title && (
            <p className={`font-semibold ${toast.variant === "destructive" ? "text-white" : "text-gray-900 dark:text-white"}`}>
              {toast.title}
            </p>
          )}
          {toast.description && (
            <p className={`text-sm ${toast.variant === "destructive" ? "text-white/90" : "text-gray-600 dark:text-gray-300"}`}>
              {toast.description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
