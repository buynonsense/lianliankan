import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            🎮 连连看游戏
          </h1>
          <p className="text-gray-700 font-medium">经典消除游戏，挑战你的观察力和反应速度</p>
        </div>

        {/* 游戏特色 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2">🎯 多种难度</h3>
            <p className="text-sm text-blue-800">简单、中等、困难三种模式任你选择</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-bold text-green-900 mb-2">🏆 积分排行</h3>
            <p className="text-sm text-green-800">全球玩家排行榜，看谁是真正的高手</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-bold text-purple-900 mb-2">👤 用户系统</h3>
            <p className="text-sm text-purple-800">保存进度，追踪你的游戏成就</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="font-bold text-orange-900 mb-2">⚡ 实时对战</h3>
            <p className="text-sm text-orange-800">挑战自我，创造最佳成绩</p>
          </div>
        </div>

        {/* 快速开始 */}
        <div className="text-center space-y-3">
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              注册
            </Link>
            <Link
              href="/game"
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
            >
              开始游戏
            </Link>
          </div>
          <Link
            href="/leaderboard"
            className="inline-block px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            查看排行榜 →
          </Link>
        </div>

        {/* 游戏说明 */}
        <div className="mt-8 pt-8 border-t border-gray-300">
          <h3 className="font-bold text-lg mb-3 text-gray-900">游戏玩法</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-800 text-sm font-medium">
            <li>点击选择一个方块，再点击另一个相同图案的方块进行消除</li>
            <li>两个方块之间的连接路径不能超过2个拐点</li>
            <li>消除所有方块即可完成游戏</li>
            <li>时间越短、步数越少，获得的积分越多</li>
            <li>完成游戏后积分会自动计入排行榜</li>
          </ol>
        </div>

        {/* 开发信息 */}
        <div className="mt-6 text-center text-xs text-gray-600 font-medium">
          <p>Next.js + SQLite + TypeScript</p>
        </div>
      </div>
    </div>
  )
}
