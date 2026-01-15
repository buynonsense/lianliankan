import { memo } from 'react'
import { motion } from 'framer-motion'

interface TileProps {
  type: number
}

const Tile = memo(({ type }: TileProps) => {
  // 预定义的柔和色彩主题
  const tileStyles = [
    { bg: 'from-pink-100 to-pink-200', text: 'text-pink-600', icon: '🌸' },
    { bg: 'from-blue-100 to-blue-200', text: 'text-blue-600', icon: '💎' },
    { bg: 'from-purple-100 to-purple-200', text: 'text-purple-600', icon: '🔮' },
    { bg: 'from-orange-100 to-orange-200', text: 'text-orange-600', icon: '🍊' },
    { bg: 'from-green-100 to-green-200', text: 'text-green-600', icon: '🍃' },
    { bg: 'from-yellow-100 to-yellow-200', text: 'text-yellow-600', icon: '🌙' },
    { bg: 'from-indigo-100 to-indigo-200', text: 'text-indigo-600', icon: '⭐' },
    { bg: 'from-rose-100 to-rose-200', text: 'text-rose-600', icon: '🌹' },
    { bg: 'from-cyan-100 to-cyan-200', text: 'text-cyan-600', icon: '🫧' },
    { bg: 'from-teal-100 to-teal-200', text: 'text-teal-600', icon: '🍀' },
    { bg: 'from-amber-100 to-amber-200', text: 'text-amber-600', icon: '⚡' },
    { bg: 'from-emerald-100 to-emerald-200', text: 'text-emerald-600', icon: '🌿' },
  ]

  const style = tileStyles[type % tileStyles.length]

  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br ${style.bg} rounded-2xl flex items-center justify-center ${style.text} text-2xl sm:text-3xl md:text-4xl shadow-sm border border-white/40 backdrop-blur-sm transition-shadow hover:shadow-lg font-bold group`}
    >
      <span className="drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
        {style.icon}
      </span>
    </motion.div>
  )
})

Tile.displayName = 'Tile'

export default Tile