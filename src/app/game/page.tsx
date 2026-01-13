'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Board from '@/components/game/Board'
import GameControls from '@/components/game/GameControls'
import { Board as BoardType, Position, Tile as TileType } from '@/lib/game/logic'

export default function GamePage() {
  const router = useRouter()

  const [board, setBoard] = useState<BoardType | null>(null)
  const [difficulty, setDifficulty] = useState('easy')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [highlightPath, setHighlightPath] = useState<Position[]>([])
  const [time, setTime] = useState(0)
  const [moves, setMoves] = useState(0)
  const [score, setScore] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && !isPaused && startTime) {
      interval = setInterval(() => {
        setTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isPaused, startTime])

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
      setMessage('')
      setStartTime(Date.now())
    } catch (error: any) {
      setMessage(error.message)
    }
  }, [difficulty])

  // 处理方块点击
  const handleTileClick = useCallback(async (position: Position, tile: TileType | null) => {
    if (!board || !isPlaying || isPaused || isProcessing) return

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

    // 验证选择的两个方块
    setIsProcessing(true)
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
        // 显示连接路径
        setHighlightPath(data.path)

        setTimeout(() => {
          setBoard(data.newBoard)
          setMoves(prev => prev + 1)
          setHighlightPath([])
          setSelectedPosition(null)

          // 检查是否完成
          if (data.completed) {
            finishGame()
          }
        }, 500)
      } else {
        // 无效选择，短暂显示错误效果
        setSelectedPosition(null)
        setMessage('无法连接这两个方块')
        setTimeout(() => setMessage(''), 1000)
      }
    } catch (error: any) {
      setMessage(error.message)
      setSelectedPosition(null)
    } finally {
      setIsProcessing(false)
    }
  }, [board, selectedPosition, isPlaying, isPaused, isProcessing])

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
        setMessage(`🎉 恭喜完成！获得 ${data.score} 积分！`)
        setIsPlaying(false)
      } else {
        setMessage(data.error || '保存成绩失败')
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
      setMessage(error.message)
    }
  }, [startTime, moves, difficulty, board])

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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">连连看游戏</h1>

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

        {/* 消息提示 */}
        {message && (
          <div className="text-center mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-900 font-medium rounded-lg">
            {message}
          </div>
        )}

        {/* 游戏棋盘 */}
        <div className="flex justify-center mb-6">
          {board ? (
            <Board
              board={board}
              onTileClick={handleTileClick}
              selectedPosition={selectedPosition}
              highlightPath={highlightPath}
              isProcessing={isProcessing}
            />
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <p className="text-gray-800 font-medium mb-4">选择难度并点击"开始游戏"来开始</p>
              <button
                onClick={startNewGame}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
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
            <div className="bg-white p-8 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">游戏暂停</h2>
              <button
                onClick={togglePause}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                继续游戏
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}