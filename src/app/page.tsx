'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Trophy, Users, Zap, Star } from 'lucide-react'

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
  }

  const features = [
    { icon: Star, title: '多种难度', desc: '从新手到大师的进阶之路', color: 'bg-pink-100 text-pink-500' },
    { icon: Trophy, title: '积分排行', desc: '争夺荣誉之巅的全球竞技', color: 'bg-blue-100 text-blue-500' },
    { icon: Users, title: '社交互动', desc: '展示你的成就，追踪进步', color: 'bg-purple-100 text-purple-500' },
    { icon: Zap, title: '快速挑战', desc: '在毫秒之间超越自我的界限', color: 'bg-orange-100 text-orange-500' }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center pt-20 px-6">
      {/* 背景动态元素 */}
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse"></div>
      <div className="absolute bottom-20 left-[10%] w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl w-full text-center relative z-10"
      >
        <motion.div variants={itemVariants} className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New Aesthetic Version
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-foreground mb-6 leading-tight">
            连接<span className="text-primary italic">想象力</span><br/>重定义<span className="text-secondary">经典</span>
          </h1>
          <p className="max-w-xl mx-auto text-foreground/50 text-xl font-medium leading-relaxed">
            这不仅是一款游戏。这是一场视觉的盛宴，一次逻辑的旅行。在极简与唯美中，感受消除的纯粹快感。
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
          <Link href="/game" className="group relative px-10 py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="flex items-center gap-2 relative z-10">
              <Play fill="currentColor" size={24} />
              <span>立即启程</span>
            </div>
          </Link>
          <Link href="/leaderboard" className="px-10 py-5 bg-white text-foreground/70 rounded-2xl font-black text-xl border border-primary/10 shadow-xl transition-all hover:bg-white/80 hover:scale-105">
            查看全球排名
          </Link>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left"
        >
          {features.map((feature, idx) => (
            <div key={idx} className="glass group p-6 rounded-[2rem] border border-white/50 transition-all hover:-translate-y-2 hover:bg-white/80">
              <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-12`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-black text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-foreground/40 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* 到底提示 */}
        <motion.div 
          variants={itemVariants}
          className="mt-20 flex flex-col items-center gap-2 text-foreground/30 font-bold text-[10px] uppercase tracking-tighter"
        >
          <div className="w-1 h-12 bg-gradient-to-b from-primary/50 to-transparent rounded-full animate-bounce"></div>
          向下滚动发现更多
        </motion.div>
      </motion.div>
    </div>
  )
}
