'use client'

import { useEffect, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose: (id: string) => void
}

const typeStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: '✓',
    progress: 'bg-green-500'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: '✕',
    progress: 'bg-red-500'
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: '⚠',
    progress: 'bg-yellow-500'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'ℹ',
    progress: 'bg-blue-500'
  }
}

export default function Toast({ id, type, message, duration = 4000, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 300)
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

  const styles = typeStyles[type]

  return (
    <div
      className={`relative ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'} mb-3`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`flex items-center gap-3 p-4 rounded-lg border ${styles.bg} ${styles.border} ${styles.text} shadow-lg min-w-[300px] max-w-[400px]`}>
        <span className="text-xl font-bold">{styles.icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium leading-tight">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="ml-2 text-lg font-bold opacity-60 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>
      {/* 进度条 */}
      <div className="absolute bottom-0 left-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden w-full">
        <div
          className={`h-full ${styles.progress} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}