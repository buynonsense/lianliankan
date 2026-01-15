'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Board from '@/components/game/Board'
import GameControls from '@/components/game/GameControls'
import { Board as BoardType, Position, Tile as TileType } from '@/lib/game/logic'
import { useToast } from '@/context/ToastContext'
import { Trophy, Gamepad2, Timer, Footprints, Info } from 'lucide-react'

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
      // 优化：在客户端直接生成棋盘，消除网络延迟感
      // 这里的逻辑应与服务器保持一致，但响应是即时的
      const { generateBoard } = await import('@/lib/game/logic')
      const { getGameConfig } = await import('@/lib/game/scoring')
      
      const config = getGameConfig(difficulty)
      const newBoard = generateBoard(config.size, config.tileTypes)

      setBoard(newBoard)
      setIsPlaying(true)
      setIsPaused(false)
      setSelectedPosition(null)
      setHighlightPath([])
      setTime(0)
      setMoves(0)
      setScore(0)
      setStartTime(Date.now())
      
      success('游戏开始！加油！')

      // 在后台同步或验证（如果需要记录游戏开始，目前 schema 似乎没有这个需求）
      /* 
      fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty }),
      }).catch(console.error)
      */
    } catch (err: unknown) {
      if (err instanceof Error) {
        error(err.message)
      } else {
        error('无法开始游戏')
      }
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        error(err.message)
      } else {
        error('保存成绩失败')
      }
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        error(err.message)
      } else {
        error('验证失败')
      }
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

  return (
    <div className="min-h-screen py-24 px-4 bg-[radial-gradient(circle_at_top_right,_var(--primary),_transparent_40%)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
          {/* 左侧：游戏信息与控制 */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-80 space-y-8 order-2 lg:order-1 lg:sticky lg:top-24"
          >
            <div className="glass p-8 rounded-[2rem] space-y-6">
              <h2 className="text-2xl font-bold text-foreground/80 flex items-center gap-2">
                <Trophy size={24} className="text-primary" />
                <span>实时状态</span>
              </h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/40 p-5 rounded-2xl border border-primary/5 group transition-all hover:bg-white/60">
                  <div className="flex items-center gap-3 mb-1">
                    <Trophy size={16} className="text-primary/60" />
                    <p className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">当前得分</p>
                  </div>
                  <p className="text-4xl font-black text-primary tabular-nums group-hover:scale-105 transition-transform origin-left">{score}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/40 p-4 rounded-2xl border border-primary/5 flex flex-col items-center">
                    <Timer size={18} className="text-primary/60 mb-2" />
                    <p className="text-[10px] font-bold text-foreground/40 uppercase mb-1">耗时</p>
                    <p className="text-2xl font-black text-primary/80 tabular-nums">{time}s</p>
                  </div>
                  <div className="bg-white/40 p-4 rounded-2xl border border-primary/5 flex flex-col items-center">
                    <Footprints size={18} className="text-primary/60 mb-2" />
                    <p className="text-[10px] font-bold text-foreground/40 uppercase mb-1">步数</p>
                    <p className="text-2xl font-black text-primary/80 tabular-nums">{moves}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-primary/5">
                <GameControls
                  difficulty={difficulty}
                  onDifficultyChange={setDifficulty}
                  onNewGame={startNewGame}
                  onPause={togglePause}
                  isPaused={isPaused}
                  isPlaying={isPlaying}
                />
              </div>
            </div>

            {/* 玩法说明 */}
            <div className="glass p-6 rounded-[1.5rem] bg-white/30 border border-white/40">
              <h3 className="font-bold text-sm mb-4 text-foreground/70 flex items-center gap-2">
                <Info size={16} className="text-primary" />
                玩法指南
              </h3>
              <ul className="text-xs text-foreground/60 space-y-3 leading-relaxed font-medium">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>点击两个相同图案的方块进行消除</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>连接路径不能超过 2 个拐点</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>消除速度越快，最终得分加成越高</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>无路可走时，棋盘会自动进行洗牌</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* 右侧：游戏棋盘 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center order-1 lg:order-2"
          >
            <AnimatePresence mode="wait">
              {!isPlaying ? (
                <motion.div 
                  key="start-screen"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass p-12 md:p-16 rounded-[3rem] text-center max-w-lg w-full relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                  
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping"></div>
                    <Gamepad2 size={48} className="text-primary relative z-10" />
                  </div>
                  
                  {board ? (
                    <>
                      <h1 className="text-4xl font-black text-foreground mb-4">精彩完成！</h1>
                      <p className="text-foreground/60 mb-10 leading-relaxed font-medium">
                        美妙的连结！成绩已成功同步至云端。<br/>要尝试更高难度的挑战吗？
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="text-4xl font-black text-foreground mb-4">开启治愈之旅</h1>
                      <p className="text-foreground/60 mb-10 leading-relaxed font-medium">
                        在方块的碰撞中寻找宁静。<br/>放空心灵，享受这一场视觉与逻辑的盛宴。
                      </p>
                    </>
                  )}
                  
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={startNewGame}
                      className="px-10 py-5 bg-primary text-white rounded-2xl font-bold shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full text-xl"
                    >
                      {board ? '再来一局' : '开始游戏'}
                    </button>
                    {!board && (
                      <button
                        onClick={handleGoHome}
                        className="text-foreground/40 font-bold hover:text-primary transition-colors text-sm"
                      >
                        返回首页
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="game-board"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <div className="absolute -inset-10 bg-primary/5 rounded-[4rem] blur-3xl group-hover:blur-[5rem] transition-all opacity-40"></div>
                  
                  <div className="relative">
                    {board && (
                      <Board
                        board={board}
                        onTileClick={handleTileClick}
                        selectedPosition={selectedPosition}
                        highlightPath={highlightPath}
                        isProcessing={isVerifying}
                      />
                    )}
                  </div>

                  <AnimatePresence>
                    {isPaused && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 glass rounded-[3rem] flex items-center justify-center backdrop-blur-md"
                      >
                        <div className="text-center p-8">
                          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Timer size={40} className="text-primary animate-pulse" />
                          </div>
                          <h2 className="text-5xl font-black text-primary mb-12">已暂停</h2>
                          <div className="flex flex-col gap-4">
                            <button
                              onClick={togglePause}
                              className="px-12 py-5 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all text-xl shadow-xl shadow-primary/20"
                            >
                              继续游戏
                            </button>
                            <button
                              onClick={handleGoHome}
                              className="px-12 py-5 bg-white/50 text-foreground/70 rounded-2xl font-bold hover:bg-white transition-all"
                            >
                              返回首页
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}