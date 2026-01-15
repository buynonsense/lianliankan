'use client'

import { Play, RotateCcw, Pause, PlayCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface GameControlsProps {
  difficulty: string
  onDifficultyChange: (difficulty: string) => void
  onNewGame: () => void
  onPause: () => void
  isPaused: boolean
  isPlaying: boolean
}

export default function GameControls({
  difficulty,
  onDifficultyChange,
  onNewGame,
  onPause,
  isPaused,
  isPlaying,
}: GameControlsProps) {
  const difficulties = [
    { id: 'easy', label: '初级', size: '6x6' },
    { id: 'medium', label: '中级', size: '8x8' },
    { id: 'hard', label: '高级', size: '10x10' },
  ]

  return (
    <div className="space-y-6">
      {/* 难度选择器 */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest pl-1">
          难度选择
        </label>
        <div className="grid grid-cols-3 gap-2">
          {difficulties.map((d) => (
            <button
              key={d.id}
              disabled={isPlaying}
              onClick={() => onDifficultyChange(d.id)}
              className={`
                relative px-3 py-4 rounded-xl border-2 transition-all duration-300 group
                ${difficulty === d.id 
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                  : 'border-transparent bg-white/40 hover:bg-white/60'}
                ${isPlaying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex flex-col items-center gap-1">
                <span className={`text-sm font-black ${difficulty === d.id ? 'text-primary' : 'text-foreground/70'}`}>
                  {d.label}
                </span>
                <span className={`text-[10px] font-bold ${difficulty === d.id ? 'text-primary/60' : 'text-foreground/30'}`}>
                  {d.size}
                </span>
              </div>
              {difficulty === d.id && (
                <motion.div 
                  layoutId="active-difficulty"
                  className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-sm"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onNewGame}
          className="group relative px-6 py-4 bg-primary text-white rounded-2xl font-black text-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="flex items-center justify-center gap-2 relative z-10">
            {isPlaying ? (
              <>
                <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>重新开始</span>
              </>
            ) : (
              <>
                <Play size={20} fill="currentColor" />
                <span>立即开始</span>
              </>
            )}
          </div>
        </button>

        {isPlaying && (
          <button
            onClick={onPause}
            className={`
              px-6 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2
              ${isPaused 
                ? 'bg-secondary text-white shadow-xl shadow-secondary/20 hover:scale-[1.02]' 
                : 'bg-white/60 text-foreground/60 hover:bg-white/80'}
            `}
          >
            {isPaused ? (
              <>
                <PlayCircle size={20} />
                <span>继续游戏</span>
              </>
            ) : (
              <>
                <Pause size={20} />
                <span>暂停休息</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}