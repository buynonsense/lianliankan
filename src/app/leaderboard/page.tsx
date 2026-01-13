import { Suspense } from 'react'
import Link from 'next/link'
import LeaderboardContent from './LeaderboardContent'

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 页面标题和返回按钮 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
          >
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">🏆 排行榜</h1>
        </div>
        <Link
          href="/game"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          去玩游戏
        </Link>
      </div>

      <Suspense fallback={
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-800 font-medium">加载排行榜中...</p>
        </div>
      }>
        <LeaderboardContent />
      </Suspense>
    </div>
  )
}