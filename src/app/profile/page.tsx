import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/database/client'
import Link from 'next/link'
import { User, Mail, Calendar, Trophy, Gamepad2, Zap, Settings, ArrowRight } from 'lucide-react'

export default async function ProfilePage() {
  // 获取认证cookie
  const cookieStore = await cookies()
  const token = cookieStore.get('auth')?.value

  if (!token) {
    redirect('/login')
  }

  // 验证token
  const payload = await verifyToken(token)
  if (!payload) {
    redirect('/login')
  }

  // 获取用户信息
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      email: true,
      totalScore: true,
      gamesPlayed: true,
      createdAt: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* 页面标题 */}
      <div className="mb-12 space-y-2">
        <h1 className="text-4xl font-black text-foreground tracking-tight">个人档案</h1>
        <p className="text-foreground/40 font-bold uppercase text-xs tracking-widest">Profile & Achievements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：用户信息卡片 */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass rounded-[2.5rem] p-8 border border-white/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-colors" />
            
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 relative z-10">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#f8ad9d] via-[#fbc4ab] to-[#ffddd2] p-1 shadow-2xl shadow-primary/20 hover:scale-105 transition-transform duration-500">
                <div className="w-full h-full bg-white/40 backdrop-blur-xl rounded-full flex items-center justify-center text-primary text-5xl font-black border border-white/60">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-foreground">{user.username}</h2>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-foreground/40 font-bold text-sm">
                    <Mail size={14} />
                    {user.email}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="flex items-center gap-3 text-foreground/60 font-black text-xs uppercase tracking-tighter italic bg-white/30 px-4 py-2 rounded-xl border border-white/50">
                    <Calendar size={14} className="text-primary" />
                    <span>始于 {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground/60 font-black text-xs uppercase tracking-tighter italic bg-white/30 px-4 py-2 rounded-xl border border-white/50">
                    <User size={14} className="text-secondary" />
                    <span>序列 #{String(user.id).substring(0, 6)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-primary/5">
              <div className="bg-white/40 border border-white/50 rounded-3xl p-6 text-center group/card hover:bg-white/60 transition-colors">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover/card:scale-110 transition-transform">
                  <Trophy className="text-primary" size={20} />
                </div>
                <div className="text-2xl font-black text-foreground tabular-nums">{user.totalScore.toLocaleString()}</div>
                <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-1">殿堂总分</div>
              </div>

              <div className="bg-white/40 border border-white/50 rounded-3xl p-6 text-center group/card hover:bg-white/60 transition-colors">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover/card:scale-110 transition-transform">
                  <Gamepad2 className="text-secondary" size={20} />
                </div>
                <div className="text-2xl font-black text-foreground tabular-nums">{user.gamesPlayed}</div>
                <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-1">游戏局数</div>
              </div>

              <div className="bg-white/40 border border-white/50 rounded-3xl p-6 text-center group/card hover:bg-white/60 transition-colors">
                <div className="w-10 h-10 bg-yellow-400/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover/card:scale-110 transition-transform">
                  <Zap className="text-yellow-600" size={20} />
                </div>
                <div className="text-2xl font-black text-foreground tabular-nums">
                  {user.gamesPlayed > 0 ? Math.round(user.totalScore / user.gamesPlayed) : 0}
                </div>
                <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mt-1">平均效率</div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：操作面板 */}
        <div className="space-y-6">
          <div className="glass rounded-[2.5rem] p-8 border border-white/50 space-y-6">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <Settings size={20} className="text-primary" />
              导航中心
            </h3>
            
            <div className="space-y-3">
              <Link
                href="/game"
                className="group flex items-center justify-between p-4 bg-primary text-white rounded-[1.5rem] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Gamepad2 size={20} />
                  <span className="font-black">开始游戏</span>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/leaderboard"
                className="group flex items-center justify-between p-4 bg-white/50 border border-primary/5 rounded-[1.5rem] hover:bg-white/80 transition-all"
              >
                <div className="flex items-center gap-3 text-foreground/80 font-black">
                  <Trophy size={20} />
                  <span>冲击排名</span>
                </div>
                <ArrowRight size={18} className="text-foreground/20 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="pt-4 border-t border-primary/5">
              <p className="text-[10px] font-bold text-foreground/30 leading-relaxed italic">
                “每一个连接，都是思维的一场绽放。”
              </p>
            </div>
          </div>

          {/* 装饰卡片 */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-white/40 rounded-[2.5rem] p-8 text-center">
            <div className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">System Version</div>
            <div className="text-xl font-black text-foreground/10 mt-1 italic tracking-tighter">v2.4.0 Soft Aesthetic</div>
          </div>
        </div>
      </div>
    </div>
  )
}
