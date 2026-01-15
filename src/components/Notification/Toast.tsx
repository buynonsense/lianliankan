'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose: (id: string) => void
}

const typeConfig = {
  success: {
    icon: <CheckCircle2 size={20} className="text-[#f8ad9d]" />,
    border: 'border-[#f8ad9d]/20',
    progress: 'bg-[#f8ad9d]',
    accent: 'text-[#f8ad9d]'
  },
  error: {
    icon: <AlertCircle size={20} className="text-[#fb64ab]" />,
    border: 'border-[#fb64ab]/20',
    progress: 'bg-[#fb64ab]',
    accent: 'text-[#fb64ab]'
  },
  warning: {
    icon: <AlertTriangle size={20} className="text-amber-400" />,
    border: 'border-amber-400/20',
    progress: 'bg-amber-400',
    accent: 'text-amber-400'
  },
  info: {
    icon: <Info size={20} className="text-purple-400" />,
    border: 'border-purple-400/20',
    progress: 'bg-purple-400',
    accent: 'text-purple-400'
  }
}

export default function Toast({ id, type, message, duration = 4000, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)

  const handleClose = useCallback(() => {
    onClose(id)
  }, [id, onClose])

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          handleClose()
          return 0
        }
        return prev - (100 / (duration / 50))
      })
    }, 50)

    return () => clearInterval(interval)
  }, [duration, isPaused, handleClose])

  const config = typeConfig[type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="mb-3 w-[320px] pointer-events-auto"
    >
      <div className={`glass relative overflow-hidden rounded-2xl border ${config.border} p-4 shadow-xl`}>
        <div className="flex items-start gap-4">
          <div className="mt-0.5 shrink-0 bg-white/50 p-2 rounded-xl shadow-inner border border-white/40">
            {config.icon}
          </div>
          
          <div className="flex-1 min-w-0 pr-2 pt-1">
            <p className="text-sm font-black text-foreground/80 leading-snug break-words">
              {message}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors text-foreground/30 hover:text-foreground/60"
          >
            <X size={16} />
          </button>
        </div>

        {/* 进度条 */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20">
          <motion.div
            className={`h-full ${config.progress} opacity-40 shadow-[0_0_8px_rgba(255,255,255,0.5)]`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear', duration: 0.05 }}
          />
        </div>
      </div>
    </motion.div>
  )
}
