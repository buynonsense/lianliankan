import { memo } from 'react'

interface TileProps {
  type: number
}

const Tile = memo(({ type }: TileProps) => {
  // 预定义的颜色和图标（使用更深的颜色提高对比度）
  const tileStyles = [
    { bg: 'bg-red-600', icon: '🔴' },
    { bg: 'bg-blue-600', icon: '🔵' },
    { bg: 'bg-green-600', icon: '🟢' },
    { bg: 'bg-yellow-600', icon: '🟡' },
    { bg: 'bg-purple-600', icon: '🟣' },
    { bg: 'bg-orange-600', icon: '🟠' },
    { bg: 'bg-pink-600', icon: '💗' },
    { bg: 'bg-cyan-600', icon: '💎' },
    { bg: 'bg-indigo-600', icon: '⭐' },
    { bg: 'bg-teal-600', icon: '✨' },
    { bg: 'bg-lime-600', icon: '🍀' },
    { bg: 'bg-rose-600', icon: '🌸' },
    { bg: 'bg-fuchsia-600', icon: '🔮' },
    { bg: 'bg-amber-600', icon: '⚡' },
    { bg: 'bg-emerald-600', icon: '🌿' },
    { bg: 'bg-sky-600', icon: '🌙' },
  ]

  const style = tileStyles[type % tileStyles.length]

  return (
    <div className={`w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 ${style.bg} rounded-md flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl shadow-lg font-bold`}>
      {style.icon}
    </div>
  )
})

Tile.displayName = 'Tile'

export default Tile