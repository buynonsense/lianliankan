'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Board from '@/components/game/Board'
import GameControls from '@/components/game/GameControls'
import { Board as BoardType, Position, Tile as TileType } from '@/lib/game/logic'
import { useToast } from '@/context/ToastContext'

export default function GamePage() {
  const router = useRouter()
  const { success, error, warning, info } = useToast()

  const [board, setBoard] = useState<BoardType | null>(null)
  const [difficulty, setDifficulty] = useState('easy')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [highlightPath, setHighlightPath] = useState<Position[]>([])
  const [time, setTime] = useState(0)
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  // 用于清理动画timeout，防止竞态条件
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 游戏计时器
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && !isPaused && startTime) {
      interval = setInterval(() => {
        setTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isPaused, startTime])

  // 清理动画timeout，防止内存泄漏
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // 开始新游戏
  const startNewGame = useCallback(async () => {
    try {
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '无法开始游戏')
      }

      setBoard(data.game.board)
      setIsPlaying(true)
      setIsPaused(false)
      setSelectedPosition(null)
      setHighlightPath([])
      setTime(0)
      setMoves(0)
      setScore(0)
      setStartTime(Date.now())
      success('游戏开始！加油！')
    } catch (error: any) {
      error(error.message)
    }
  }, [difficulty, success, error])

  // 完成游戏
  const finishGame = useCallback(async () => {
    if (!startTime || !board) return

    const timeSeconds = Math.floor((Date.now() - startTime) / 1000)
    const boardSize = board.length

    // 计算临时分数（用于显示）
    const tempScore = calculateTempScore(timeSeconds, moves, difficulty, boardSize)
    setScore(tempScore)

    // 调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('[GameSubmit] 准备提交游戏结果:', {
        timeSeconds,
        moves,
        boardSize,
        difficulty,
        expectedMinMoves: boardSize * boardSize / 2,
        expectedMaxMoves: boardSize * boardSize * 2,
      })
    }

    try {
      const res = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeSeconds,
          moves,
          boardSize,
          difficulty,
          completed: true,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        success(`🎉 恭喜完成！获得 ${data.score} 积分！`, 3000)
        setIsPlaying(false)
      } else {
        error(data.error || '保存成绩失败')
        // 如果验证失败，在开发环境显示详细信息用于调试
        if (process.env.NODE_ENV === 'development') {
          console.log('[GameSubmit] 验证失败:', data, {
            submittedData: { timeSeconds, moves, boardSize, difficulty },
            expectedMinMoves: boardSize * boardSize / 2,
            expectedMaxMoves: boardSize * boardSize * 2,
          })
        }
      }
    } catch (error: any) {
      error(error.message)
    }
  }, [startTime, moves, difficulty, board, success, error])

  // 处理方块点击
  const handleTileClick = useCallback(async (position: Position, tile: TileType | null) => {
    if (!board || !isPlaying || isPaused || isVerifying) return

    // 如果点击空位置，取消选择
    if (!tile) {
      setSelectedPosition(null)
      return
    }

    // 如果没有选择，选择当前方块
    if (!selectedPosition) {
      setSelectedPosition(position)
      return
    }

    // 如果点击同一个方块，取消选择
    if (selectedPosition.row === position.row && selectedPosition.col === position.col) {
      setSelectedPosition(null)
      return
    }

    // 防止快速连续点击同一对方块（在动画期间）
    if (highlightPath.length > 0) {
      const start = highlightPath[0]
      const end = highlightPath[highlightPath.length - 1]
      if ((start.row === position.row && start.col === position.col) ||
          (end.row === position.row && end.col === position.col)) {
        return
      }
    }

    // 验证选择的两个方块
    setIsVerifying(true)
    try {
      const res = await fetch('/api/game/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board,
          start: selectedPosition,
          end: position,
        }),
      })

      const data = await res.json()

      if (data.valid) {
        // 清理之前的timeout，防止竞态条件
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current)
        }

        // 立即显示连接路径并重置选中状态，让用户可以立即进行下一次点击
        setHighlightPath(data.path)
        setSelectedPosition(null)

        // 立即允许新的点击（不等待动画结束）
        setIsVerifying(false)

        // 500ms后执行实际的棋盘更新和状态清理
        animationTimeoutRef.current = setTimeout(() => {
          setBoard(data.newBoard)
          setMoves(prev => prev + 1)
          setHighlightPath([])

          // 检查是否完成
          if (data.completed) {
            finishGame()
          }
        }, 500)
      } else {
        // 无效选择，显示错误提示
        setSelectedPosition(null)
        warning('无法连接这两个方块', 2000)
        setIsVerifying(false)
      }
    } catch (error: any) {
      error(error.message)
      setSelectedPosition(null)
      setHighlightPath([])  // 清空路径，避免遗留状态
      setIsVerifying(false)
    }
  }, [board, selectedPosition, isPlaying, isPaused, isVerifying, highlightPath, finishGame, warning, error])

  // 临时分数计算（客户端显示用）
  const calculateTempScore = (timeSeconds: number, moves: number, difficulty: string, boardSize: number) => {
    const baseScore = boardSize * boardSize * 10
    const maxTime = 180
    const timeBonus = Math.max(0, maxTime - timeSeconds) * 2
    const optimalMoves = boardSize * boardSize / 2
    const moveBonus = Math.max(0, optimalMoves - moves) * 5
    const multiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty] || 1
    return Math.round((baseScore + timeBonus + moveBonus) * multiplier)
  }

  // 暂停/继续
  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // 返回首页
  const handleGoHome = () => {
    if (isPlaying) {
      info('游戏已暂停，您可以继续游戏或返回首页')
      setIsPaused(true)
    } else {
      success('已返回首页')
      router.push('/')
    }
  }

  // 查看排行榜
  const handleViewLeaderboard = () => {
    success('正在跳转到排行榜...')
    router.push('/leaderboard')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 页面标题和操作栏 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoHome}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
          >
            ← 返回首页
          </button>
          <h1 className="text-3xl font-bold text-gray-900">连连看游戏</h1>
        </div>

        {/* 游戏完成后的快捷操作 */}
        {!isPlaying && board && (
          <div className="flex gap-2 items-center">
            <button
              onClick={startNewGame}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              aria-label="立即开始新游戏"
            >
              立即开始新游戏
            </button>
            <button
              onClick={handleViewLeaderboard}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              aria-label="查看排行榜"
            >
              查看排行榜
            </button>
          </div>
        )}
      </div>

      {/* 游戏控制栏 */}
      <div className="flex justify-center mb-6">
        <GameControls
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onNewGame={startNewGame}
          onPause={togglePause}
          isPaused={isPaused}
          isPlaying={isPlaying}
          time={time}
          moves={moves}
          score={score}
        />
      </div>

      {/* 游戏棋盘 */}
      <div className="flex justify-center mb-6">
        {board && isPlaying ? (
          <div role="main" aria-label="游戏棋盘区域">
            <Board
              board={board}
              onTileClick={handleTileClick}
              selectedPosition={selectedPosition}
              highlightPath={highlightPath}
              isProcessing={isVerifying}
            />
          </div>
        ) : board && !isPlaying ? (
          <div
            className="bg-white p-8 rounded-lg shadow-lg text-center"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="text-6xl mb-4" aria-hidden="true">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">恭喜完成！</h3>
            <p className="text-gray-600 mb-4">
              上局成绩已保存，准备开始新游戏
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={startNewGame}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                aria-label="立即开始新游戏"
              >
                立即开始新游戏
              </button>
            </div>
          </div>
        ) : (
          <div
            className="bg-white p-8 rounded-lg shadow-lg text-center"
            role="main"
            aria-label="游戏开始区域"
          >
            <p className="text-gray-800 font-medium mb-4">选择难度并点击"开始游戏"来开始</p>
            <button
              onClick={startNewGame}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              aria-label="开始游戏"
            >
              开始游戏
            </button>
          </div>
        )}
      </div>

      {/* 游戏说明 */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h3 className="font-bold text-lg mb-2 text-gray-900">游戏说明</h3>
        <ul className="text-sm text-gray-800 font-medium space-y-1 list-disc list-inside">
          <li>点击选择方块，再次点击另一个相同图案的方块进行消除</li>
          <li>连接路径不能超过2个拐点</li>
          <li>消除所有方块即可获胜</li>
          <li>时间越短、步数越少，得分越高</li>
          <li>如果没有可消除的方块，系统会自动重新洗牌</li>
        </ul>
      </div>

      {/* 暂停遮罩 */}
      {isPaused && isPlaying && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">⏸ 游戏暂停</h2>
            <div className="flex gap-3 justify-center">
              <button
                onClick={togglePause}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                继续游戏
              </button>
              <button
                onClick={handleGoHome}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}