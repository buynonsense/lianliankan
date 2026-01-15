import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/database/client'
import Link from 'next/link'

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">个人档案</h1>
        <p className="text-gray-600 mt-2">查看和管理您的账户信息</p>
      </div>

      {/* 用户信息卡片 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              注册时间: {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{user.totalScore}</div>
            <div className="text-sm text-gray-600 mt-1">总得分</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{user.gamesPlayed}</div>
            <div className="text-sm text-gray-600 mt-1">游戏局数</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {user.gamesPlayed > 0 ? Math.round(user.totalScore / user.gamesPlayed) : 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">平均得分</div>
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/game"
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>🎮</span>
            <span>开始新游戏</span>
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <span>🏆</span>
            <span>查看排行榜</span>
          </Link>
        </div>
      </div>

      {/* 安全提示 */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 安全提示</h4>
        <p className="text-sm text-yellow-700">
          请妥善保管您的账户信息。如果您发现任何异常活动，请立即联系管理员。
        </p>
      </div>
    </div>
  )
}