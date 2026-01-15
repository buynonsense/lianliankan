'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import FullScreenTransition from '@/components/Navigation/FullScreenTransition'
import { LogIn, User, Lock, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const router = useRouter()
  const { success, error } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '登录失败')
      }

      success('登录成功！欢迎回来！')
      setShowTransition(true)
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '登录失败'
      error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-2"
    >
      <FullScreenTransition isVisible={showTransition} />
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <LogIn className="text-primary w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">开启游戏之旅</h2>
        <p className="text-foreground/60 mt-2">很高兴再次见到你</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2 text-foreground/80">
            <User size={16} className="text-primary" />
            用户名
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-primary/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all text-gray-900"
            placeholder="输入您的用户名"
            required
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2 text-foreground/80">
            <Lock size={16} className="text-primary" />
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-primary/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all text-gray-900"
            placeholder="••••••••"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || showTransition}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogIn size={20} />
              <span>开始登录</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  )
}
