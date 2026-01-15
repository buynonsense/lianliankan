'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, ChevronDown, Gamepad2, Settings } from 'lucide-react'

interface UserMenuProps {
  user: {
    username: string
    email: string
    totalScore: number
    gamesPlayed: number
  }
  onLogout: () => void
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { success, info } = useToast()

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await onLogout()
    setIsOpen(false)
    success('已安全退出')
    info('正在返回首页...')
    setTimeout(() => {
      router.push('/')
      router.refresh()
    }, 500)
  }

  const handleProfile = () => {
    router.push('/profile')
    setIsOpen(false)
    info('正在进入个人档案...')
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* 用户头像/按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-2 py-2 rounded-[2rem] hover:bg-white/60 transition-all active:scale-95 group"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f8ad9d] via-[#fbc4ab] to-[#ffddd2] p-[2px] shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-500">
          <div className="w-full h-full bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-primary font-black text-sm border border-white/40">
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="hidden md:flex flex-col items-start gap-0.5">
          <span className="text-sm font-black text-foreground/80 leading-none">
            {user.username}
          </span>
          <span className="text-[10px] font-bold text-primary italic leading-none uppercase tracking-tighter">
            Score: {user.totalScore.toLocaleString()}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-foreground/30 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-72 glass rounded-[2rem] border border-white/50 shadow-2xl shadow-primary/10 overflow-hidden z-50 pt-6 pb-2"
          >
            {/* 用户信息头部 */}
            <div className="px-6 pb-6 border-b border-primary/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#f8ad9d] via-[#fbc4ab] to-[#ffddd2] p-[2.5px] shadow-xl shadow-primary/10">
                  <div className="w-full h-full bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-primary font-black text-xl border border-white/40">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-foreground truncate uppercase tracking-tight">{user.username}</p>
                  <p className="text-xs font-bold text-foreground/40 truncate">{user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/40 border border-white/50 px-3 py-2 rounded-xl flex flex-col items-center">
                  <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest leading-none mb-1">总分</span>
                  <span className="text-sm font-black text-primary tabular-nums">{user.totalScore}</span>
                </div>
                <div className="bg-white/40 border border-white/50 px-3 py-2 rounded-xl flex flex-col items-center">
                  <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest leading-none mb-1">局数</span>
                  <span className="text-sm font-black text-secondary tabular-nums">{user.gamesPlayed}</span>
                </div>
              </div>
            </div>

            {/* 菜单项 */}
            <div className="p-2 space-y-1">
              <button
                onClick={handleProfile}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-foreground/70 hover:bg-primary hover:text-white rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <User size={18} />
                  <span>个人档案</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:bg-white transition-colors" />
              </button>

              <button
                onClick={() => { router.push('/game'); setIsOpen(false); }}
                className="w-full flex items-center px-4 py-3 text-sm font-bold text-foreground/70 hover:bg-white/60 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3 text-secondary">
                  <Gamepad2 size={18} />
                  <span className="text-foreground/70">开始新游戏</span>
                </div>
              </button>

              <div className="h-px bg-primary/5 my-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-50 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={18} />
                  <span>退出登录</span>
                </div>
              </button>
            </div>
            
            <div className="px-6 py-3 bg-primary/5 flex items-center justify-center gap-2">
               <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest flex items-center gap-1">
                 <Settings size={10} /> System Profile v2.4
               </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
