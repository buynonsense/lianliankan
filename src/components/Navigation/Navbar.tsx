'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/hooks/useAuth'
import UserMenu from './UserMenu'

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

  const authNavigation = [
    { name: '登录', href: '/login' },
    { name: '注册', href: '/register' },
  ]

  const handleNavigation = (href: string, name: string) => {
    if (href === '/game' && pathname !== '/game') {
      info(`正在进入${name}...`)
    }
    router.push(href)
  }

  const isAuthPage = pathname === '/login' || pathname === '/register'

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 左侧：Logo和主要导航 */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/"
                className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                onClick={() => info('欢迎回到连连看游戏！')}
              >
                🎮 连连看
              </Link>
            </div>

            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href, item.name)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* 右侧：认证导航和快捷操作 */}
          <div className="flex items-center space-x-2">
            {/* 快捷操作按钮 */}
            {pathname === '/game' && (
              <button
                onClick={() => {
                  router.push('/')
                  success('已返回首页')
                }}
                className="hidden md:inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                🏠 返回首页
              </button>
            )}

            {/* 认证状态显示 */}
            {loading ? (
              // 加载状态
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : authenticated && user ? (
              // 已登录 - 显示用户菜单
              <UserMenu user={user} onLogout={logout} />
            ) : isAuthPage ? (
              // 认证页面 - 只显示返回首页
              <div className="flex items-center space-x-2">
                {pathname === '/login' && (
                  <Link
                    href="/register"
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    注册
                  </Link>
                )}
                {pathname === '/register' && (
                  <Link
                    href="/login"
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    登录
                  </Link>
                )}
                <Link
                  href="/"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  返回首页
                </Link>
              </div>
            ) : (
              // 未登录 - 显示登录/注册按钮
              <div className="hidden md:flex md:items-center md:space-x-2">
                {authNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* 移动端菜单按钮（简化版） */}
            <div className="md:hidden">
              <div className="flex items-center space-x-1">
                <Link
                  href="/"
                  className="px-2 py-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                  title="首页"
                >
                  🏠
                </Link>
                <Link
                  href="/game"
                  className="px-2 py-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                  title="游戏"
                >
                  🎮
                </Link>
                <Link
                  href="/leaderboard"
                  className="px-2 py-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                  title="排行榜"
                >
                  🏆
                </Link>
                {/* 移动端登录/用户按钮 */}
                {!loading && (
                  authenticated && user ? (
                    <button
                      onClick={() => router.push('/profile')}
                      className="px-2 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                      title="个人档案"
                    >
                      👤
                    </button>
                  ) : !isAuthPage && (
                    <Link
                      href="/login"
                      className="px-2 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                      title="登录"
                    >
                      🔒
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}