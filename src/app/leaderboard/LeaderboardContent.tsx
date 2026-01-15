'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trophy, Medal, Crown, Star, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/context/ToastContext'

interface LeaderboardEntry {
  rank: number
  username: string
  totalScore: number
  gamesPlayed: number
}

export default function LeaderboardContent() {
  const [type, setType] = useState<'total' | 'daily' | 'weekly'>('total')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { error, info } = useToast()

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)

    try {
      const res = await fetch(`/api/leaderboard?type=${type}&limit=20`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '获取排行榜失败')
      }

      setLeaderboard(data.leaderboard)
      
      const label = type === 'total' ? '殿堂总榜' : type === 'daily' ? '今日之星' : '本周强者'
      info(`已加载${label}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '未知错误'
      error(message)
    } finally {
      setLoading(false)
    }
  }, [type, error, info])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const getTypeLabel = () => {
    switch (type) {
      case 'total': return '殿堂总榜'
      case 'daily': return '今日之星'
      case 'weekly': return '本周强者'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="text-yellow-400" size={20} fill="currentColor" />
      case 2: return <Medal className="text-gray-400" size={18} fill="currentColor" />
      case 3: return <Medal className="text-amber-600" size={18} fill="currentColor" />
      default: return <span className="text-foreground/30 font-black text-xs">{rank}</span>
    }
  }

  return (
    <div className="space-y-8">
      {/* 选项卡 */}
      <div className="flex justify-center p-1 bg-white/40 backdrop-blur-md rounded-2xl border border-primary/5 w-fit mx-auto">
        {(['total', 'daily', 'weekly'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`relative px-8 py-3 rounded-xl font-black text-sm transition-all duration-300 ${
              type === t
                ? 'text-white'
                : 'text-foreground/50 hover:text-foreground/70'
            }`}
          >
            {type === t && (
              <motion.div 
                layoutId="active-tab"
                className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{t === 'total' ? '总积分' : t === 'daily' ? '今日' : '本周'}</span>
          </button>
        ))}
      </div>

      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center"
            >
              <Loader2 className="animate-spin text-primary mb-4" size={48} />
              <p className="text-foreground/40 font-bold text-sm tracking-widest uppercase">寻找强者中...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-6 mb-2">
                <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                  <Star className="text-primary fill-primary" size={24} />
                  {getTypeLabel()}
                </h2>
                <span className="text-xs font-bold text-foreground/30 uppercase tracking-tighter italic">Top 20 Legends</span>
              </div>

              <div className="glass rounded-[2rem] overflow-hidden border border-white/50">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary/5">
                        <th className="px-8 py-6 text-left text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">排名</th>
                        <th className="px-8 py-6 text-left text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">传奇玩家</th>
                        <th className="px-8 py-6 text-right text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">总积分</th>
                        <th className="px-8 py-6 text-right text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">局数</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {leaderboard.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <Trophy size={40} className="text-foreground/10" />
                              <p className="text-foreground/40 font-bold italic">荒野中尚无足迹...</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        leaderboard.map((item, index) => (
                          <motion.tr 
                            key={item.username}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-white/40 transition-colors"
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center justify-center w-10 h-10 bg-white/50 rounded-xl group-hover:bg-primary transition-all shadow-sm">
                                {getRankIcon(index + 1)}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f8ad9d] via-[#fbc4ab] to-[#ffddd2] p-[1.5px] shadow-sm group-hover:shadow-primary/20 transition-all">
                                  <div className="w-full h-full bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center text-[10px] font-black text-primary">
                                    {item.username.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <span className="font-black text-foreground/80">{item.username}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <span className="font-black text-primary text-lg tabular-nums">{item.totalScore.toLocaleString()}</span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <span className="font-bold text-foreground/40 tabular-nums">{item.gamesPlayed}</span>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 说明 */}
              <div className="text-center p-8">
                <p className="text-foreground/30 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  <span className="w-8 h-px bg-primary/10"></span>
                  多玩游戏，在排行榜上留下你的姓名
                  <span className="w-8 h-px bg-primary/10"></span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}