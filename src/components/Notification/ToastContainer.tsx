'use client'

import Toast from './Toast'
import { useToast } from '@/context/ToastContext'
import { AnimatePresence } from 'framer-motion'

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-24 right-4 z-[100] flex flex-col items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
