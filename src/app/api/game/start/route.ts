import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie, verifyToken } from '@/lib/auth/jwt'
import { generateBoard } from '@/lib/game/logic'
import { getGameConfig } from '@/lib/game/scoring'

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

    const { difficulty } = await request.json()
    const config = getGameConfig(difficulty || 'easy')

    const board = generateBoard(config.size, config.tileTypes)

    // 返回游戏初始状态
    return NextResponse.json({
      success: true,
      game: {
        board,
        config,
        startTime: Date.now(),
        moves: 0,
      },
    })
  } catch (error) {
    console.error('Start game error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}