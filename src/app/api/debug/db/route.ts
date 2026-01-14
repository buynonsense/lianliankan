import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/client'

export async function GET(request: NextRequest) {
  try {
    // 测试数据库连接
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, totalScore: true, gamesPlayed: true, createdAt: true }
    })

    // 获取游戏记录统计
    const gameRecords = await prisma.gameRecord.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, userId: true, score: true, difficulty: true, createdAt: true }
    })

    const gameCount = await prisma.gameRecord.count()
    const scoreCount = await prisma.scoreRecord.count()

    // 检查数据库文件路径
    const dbInfo = {
      users,
      userCount: users.length,
      gameRecords,
      totalGames: gameCount,
      totalScoreRecords: scoreCount,
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL || 'file:./lianliankan.db',
    }

    return NextResponse.json({
      success: true,
      database: dbInfo,
      message: '数据库连接正常',
    })
  } catch (error) {
    console.error('Database debug error:', error)
    return NextResponse.json(
      { error: '数据库连接失败', details: String(error) },
      { status: 500 }
    )
  }
}