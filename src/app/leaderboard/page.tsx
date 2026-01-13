import { Suspense } from 'react'
import LeaderboardContent from './LeaderboardContent'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">排行榜</h1>
        <Suspense fallback={<div className="text-center p-8 text-gray-800 font-medium">加载中...</div>}>
          <LeaderboardContent />
        </Suspense>
      </div>
    </div>
  )
}