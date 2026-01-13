'use client'

interface GameControlsProps {
  difficulty: string
  onDifficultyChange: (difficulty: string) => void
  onNewGame: () => void
  onPause: () => void
  isPaused: boolean
  isPlaying: boolean
  time: number
  moves: number
  score: number
}

export default function GameControls({
  difficulty,
  onDifficultyChange,
  onNewGame,
  onPause,
  isPaused,
  isPlaying,
  time,
  moves,
  score,
}: GameControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* 难度选择 */}
        <div className="flex gap-2">
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            disabled={isPlaying}
            className="px-3 py-2 border border-gray-400 rounded font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
          >
            <option value="easy">简单 (6x6)</option>
            <option value="medium">中等 (8x8)</option>
            <option value="hard">困难 (10x10)</option>
          </select>
        </div>

        {/* 游戏统计 */}
        <div className="flex gap-4 text-sm font-mono">
          <div className="flex flex-col items-center">
            <span className="text-gray-700 font-semibold">时间</span>
            <span className="text-lg font-bold text-blue-700">{formatTime(time)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-700 font-semibold">步数</span>
            <span className="text-lg font-bold text-green-700">{moves}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-700 font-semibold">得分</span>
            <span className="text-lg font-bold text-purple-700">{score}</span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex gap-2">
          <button
            onClick={onNewGame}
            className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPlaying ? '重新开始' : '开始游戏'}
          </button>
          {isPlaying && (
            <button
              onClick={onPause}
              className="px-4 py-2 bg-yellow-600 text-white rounded font-semibold hover:bg-yellow-700 transition-colors"
            >
              {isPaused ? '继续' : '暂停'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}