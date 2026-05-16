import { useEffect, useState } from 'react'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

let toastId = 0
let addToastFn: ((message: string, type: Toast['type']) => void) | null = null

export function toast(message: string, type: Toast['type'] = 'info') {
  if (addToastFn) {
    addToastFn(message, type)
  }
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    addToastFn = (message: string, type: Toast['type']) => {
      const id = ++toastId
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3000)
    }
    return () => {
      addToastFn = null
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-slide-up rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            t.type === 'success'
              ? 'bg-emerald-600 text-white'
              : t.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-slate-700 text-white'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}