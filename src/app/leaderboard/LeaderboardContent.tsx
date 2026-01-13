'use client'

import { useState, useEffect } from 'react'

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
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLeaderboard()
  }, [type])

  const fetchLeaderboard = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/leaderboard?type=${type}&limit=20`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '获取排行榜失败')
      }

      setLeaderboard(data.leaderboard)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'total': return '总积分榜'
      case 'daily': return '日榜'
      case 'weekly': return '周榜'
    }
  }

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-800 font-medium">加载排行榜中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-800 font-medium px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 排行榜类型切换 */}
      <div className="flex justify-center gap-2 mb-6">
        {(['total', 'daily', 'weekly'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-2 rounded font-semibold ${
              type === t
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {t === 'total' ? '总榜' : t === 'daily' ? '日榜' : '周榜'}
          </button>
        ))}
      </div>

      {/* 排行榜标题 */}
      <h2 className="text-2xl font-bold text-center text-gray-900">{getTypeLabel()}</h2>

      {/* 排行榜表格 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-800">排名</th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-800">玩家</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-gray-800">积分</th>
              <th className="px-4 py-3 text-right text-sm font-bold text-gray-800">游戏场次</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-700 font-medium">
                  暂无数据
                </td>
              </tr>
            ) : (
              leaderboard.map((entry) => (
                <tr
                  key={entry.rank}
                  className={`${
                    entry.rank === 1
                      ? 'bg-yellow-50'
                      : entry.rank === 2
                      ? 'bg-gray-50'
                      : entry.rank === 3
                      ? 'bg-orange-50'
                      : ''
                  } hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`font-bold ${
                        entry.rank === 1
                          ? 'text-yellow-700 text-xl'
                          : entry.rank === 2
                          ? 'text-gray-700'
                          : entry.rank === 3
                          ? 'text-orange-700'
                          : 'text-gray-600'
                      }`}
                    >
                      {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">{entry.username}</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-700">
                    {entry.totalScore}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 font-medium">
                    {entry.gamesPlayed}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 说明 */}
      <div className="text-center text-sm text-gray-800 font-medium mt-4">
        <p>💡 提示：多玩游戏，积累更多积分来提升排名吧！</p>
      </div>
    </div>
  )
}