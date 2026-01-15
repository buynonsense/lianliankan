import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/client'

// 缓存排行榜 30 秒，减少对数据库的频繁访问
export const revalidate = 30

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'total' // total, daily, weekly
    const limit = parseInt(searchParams.get('limit') || '10')

    let whereCondition = {}

    if (type === 'daily') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      whereCondition = {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      }
    } else if (type === 'weekly') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      whereCondition = {
        createdAt: {
          gte: weekAgo,
        },
      }
    }

    if (type === 'total') {
      // 总积分排行榜（基于用户表）
      const leaderboard = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          totalScore: true,
          gamesPlayed: true,
          createdAt: true,
        },
        orderBy: {
          totalScore: 'desc',
        },
        take: limit,
      })

      // 添加排名
      const ranked = leaderboard.map((user, index) => ({
        rank: index + 1,
        ...user,
      }))

      return NextResponse.json({
        success: true,
        type: 'total',
        leaderboard: ranked,
      })
    } else {
      // 日榜和周榜（基于游戏记录的分数总和）
      const leaderboard = await prisma.gameRecord.groupBy({
        by: ['userId'],
        where: whereCondition,
        _sum: {
          score: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            score: 'desc',
          },
        },
        take: limit,
      })

      // 获取用户信息
      const userIds = leaderboard.map(item => item.userId)
      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds },
        },
        select: {
          id: true,
          username: true,
        },
      })

      const userMap = new Map(users.map(user => [user.id, user.username]))

      const ranked = leaderboard.map((item, index) => ({
        rank: index + 1,
        userId: item.userId,
        username: userMap.get(item.userId) || '未知用户',
        totalScore: item._sum.score || 0,
        gamesPlayed: item._count.id,
      }))

      return NextResponse.json({
        success: true,
        type,
        leaderboard: ranked,
      })
    }
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}