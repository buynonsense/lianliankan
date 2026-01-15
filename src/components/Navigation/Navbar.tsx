'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/hooks/useAuth'
import UserMenu from './UserMenu'
import { Home, Gamepad2, Trophy, LogIn, UserPlus, User } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { success, info } = useToast()
  const { authenticated, user, loading, logout } = useAuth()

  const navigation = [
    { name: '首页', href: '/' },
    { name: '游戏', href: '/game' },
    { name: '排行榜', href: '/leaderboard' },
  ]

  const handleNavigation = (href: string, name: string) => {
    if (href === '/game' && pathname !== '/game') {
      info(`正在进入${name}...`)
    }
    router.push(href)
  }

  const isAuthPage = pathname === '/login' || pathname === '/register'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-2xl glass border-none m-4 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 左侧：Logo和主要导航 */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/"
                className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent transition-all hover:opacity-80 flex items-center gap-2"
                onClick={() => info('欢迎回到连连看游戏！')}
              >
                <Gamepad2 className="text-primary w-8 h-8" />
                <span>连连看</span>
              </Link>
            </div>

            <div className="hidden md:ml-10 md:flex md:items-center md:space-x-8">
              {navigation.map((item) => {
                const Icon = item.href === '/' ? Home : item.href === '/game' ? Gamepad2 : Trophy;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href, item.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      pathname === item.href
                        ? 'bg-primary/10 text-primary scale-105'
                        : 'text-foreground/70 hover:bg-white/50 hover:text-foreground hover:scale-105'
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 右侧：认证导航和快捷操作 */}
          <div className="flex items-center space-x-4">
            {/* 快捷操作按钮 */}
            {pathname === '/game' && (
              <button
                onClick={() => {
                  router.push('/')
                  success('已返回首页')
                }}
                className="hidden md:flex items-center gap-2 px-4 py-2 border-none text-sm leading-4 font-medium rounded-xl text-primary bg-primary/10 hover:bg-primary/20 transition-all hover:scale-105"
              >
                <Home size={18} />
                <span>返回首页</span>
              </button>
            )}

            {/* 认证状态显示 */}
            {loading ? (
              // 加载状态
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse"></div>
                <div className="h-4 w-20 bg-primary/10 rounded animate-pulse"></div>
              </div>
            ) : authenticated && user ? (
              // 已登录 - 显示用户菜单
              <UserMenu user={user} onLogout={logout} />
            ) : isAuthPage ? (
              // 认证页面 - 显示简单链接
              <div className="flex items-center space-x-2">
                {pathname === '/login' && (
                  <Link
                    href="/register"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-all"
                  >
                    <UserPlus size={18} />
                    <span>注册</span>
                  </Link>
                )}
                {pathname === '/register' && (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-all"
                  >
                    <LogIn size={18} />
                    <span>登录</span>
                  </Link>
                )}
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground"
                >
                  返回首页
                </Link>
              </div>
            ) : (
              // 未登录 - 显示登录/注册按钮
              <div className="hidden md:flex md:items-center md:space-x-4">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-primary border border-primary/20 hover:bg-primary/5 transition-all"
                >
                  <LogIn size={18} />
                  <span>登录</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  <UserPlus size={18} />
                  <span>立即注册</span>
                </Link>
              </div>
            )}

            {/* 移动端菜单按钮（简化版） */}
            <div className="md:hidden flex items-center bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 p-1">
              <Link
                href="/"
                className={`p-2 rounded-xl transition-all ${pathname === '/' ? 'bg-primary text-white shadow-lg' : 'text-foreground/40 hover:text-primary'}`}
                title="首页"
              >
                <Home size={20} />
              </Link>
              <Link
                href="/game"
                className={`p-2 rounded-xl transition-all ${pathname === '/game' ? 'bg-primary text-white shadow-lg' : 'text-foreground/40 hover:text-primary'}`}
                title="游戏"
              >
                <Gamepad2 size={20} />
              </Link>
              <Link
                href="/leaderboard"
                className={`p-2 rounded-xl transition-all ${pathname === '/leaderboard' ? 'bg-primary text-white shadow-lg' : 'text-foreground/40 hover:text-primary'}`}
                title="排行榜"
              >
                <Trophy size={20} />
              </Link>
              {!loading && (
                authenticated && user ? (
                  <button
                    onClick={() => router.push('/profile')}
                    className={`p-2 rounded-xl transition-all ${pathname === '/profile' ? 'bg-primary text-white shadow-lg' : 'text-foreground/40 hover:text-primary'}`}
                    title="个人档案"
                  >
                    <User size={20} />
                  </button>
                ) : !isAuthPage && (
                  <Link
                    href="/login"
                    className={`p-2 rounded-xl transition-all ${isAuthPage ? 'bg-primary text-white shadow-lg' : 'text-foreground/40 hover:text-primary'}`}
                    title="登录"
                  >
                    <LogIn size={20} />
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
