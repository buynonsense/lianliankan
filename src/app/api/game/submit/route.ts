import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie, verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/database/client'
import { calculateScore, validateGameResult, getGameConfig } from '@/lib/game/scoring'

// 简单的内存速率限制（生产环境应使用 Redis）
const submitAttempts = new Map<string, number>()

const RATE_LIMIT_WINDOW = 30 * 1000 // 30秒
const MAX_SUBMITS_PER_WINDOW = 5

function checkRateLimit(userId: number): boolean {
  const now = Date.now()
  const userIdStr = userId.toString()
  const lastAttempt = submitAttempts.get(userIdStr) || 0

  if (now - lastAttempt < RATE_LIMIT_WINDOW) {
    return false
  }

  submitAttempts.set(userIdStr, now)

  // 清理过期记录（简单实现，实际应使用更优雅的方案）
  if (submitAttempts.size > 1000) {
    submitAttempts.clear()
  }

  return true
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: '认证失败' }, { status: 401 })
    }

    // 速率限制检查
    if (!checkRateLimit(payload.userId)) {
      return NextResponse.json(
        { error: '提交过于频繁，请稍后再试' },
        { status: 429 }
      )
    }

    // 解析并验证请求体
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: '无效的请求格式' },
        { status: 400 }
      )
    }

    const { timeSeconds, moves, boardSize, difficulty, completed } = body

    // 基本输入验证
    if (
      typeof timeSeconds !== 'number' ||
      typeof moves !== 'number' ||
      typeof boardSize !== 'number' ||
      typeof difficulty !== 'string' ||
      typeof completed !== 'boolean'
    ) {
      return NextResponse.json(
        { error: '缺少必要的参数或参数类型错误' },
        { status: 400 }
      )
    }

    // 数值范围验证
    if (timeSeconds < 0 || moves < 0 || boardSize < 4 || boardSize > 20) {
      return NextResponse.json(
        { error: '参数值超出有效范围' },
        { status: 400 }
      )
    }

    if (!completed) {
      return NextResponse.json({
        success: true,
        score: 0,
        message: '游戏未完成，不计分',
      })
    }

    // 验证游戏结果
    const expectedConfig = getGameConfig(difficulty)
    const isValid = validateGameResult(
      { timeSeconds, moves, boardSize, difficulty, completed },
      expectedConfig
    )

    if (!isValid) {
      return NextResponse.json(
        { error: '游戏结果验证失败' },
        { status: 400 }
      )
    }

    // 计算分数
    const score = calculateScore({
      timeSeconds,
      moves,
      boardSize,
      difficulty,
      completed,
    })

    // 保存游戏记录
    const gameRecord = await prisma.gameRecord.create({
      data: {
        userId: payload.userId,
        score,
        timeSeconds,
        moves,
        boardSize,
        difficulty,
        completed,
      },
    })

    // 创建积分记录
    await prisma.scoreRecord.create({
      data: {
        userId: payload.userId,
        gameRecordId: gameRecord.id,
        scoreChange: score,
        reason: `完成${difficulty}难度游戏`,
      },
    })

    // 更新用户总积分
    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        totalScore: { increment: score },
        gamesPlayed: { increment: 1 },
      },
    })

    return NextResponse.json({
      success: true,
      score,
      gameRecordId: gameRecord.id,
      message: '成绩已保存',
    })
  } catch (error) {
    console.error('Submit score error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}