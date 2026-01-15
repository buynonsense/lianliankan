import { NextRequest, NextResponse } from 'next/server'
import { canConnect, removeTiles, isGameCompleted, hasPossibleMoves, shuffleBoard } from '@/lib/game/logic'

export async function POST(request: NextRequest) {
  try {
    const { board, start, end } = await request.json()

    if (!board || !start || !end) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const path = canConnect(board, start, end)

    if (path) {
      // 移除方块
      const newBoard = removeTiles(board, path)

      // 检查是否还有可移动的方块，如果没有则重新洗牌
      let finalBoard = newBoard
      if (!isGameCompleted(newBoard) && !hasPossibleMoves(newBoard)) {
        finalBoard = shuffleBoard(newBoard)
      }

      const completed = isGameCompleted(finalBoard)

      return NextResponse.json({
        success: true,
        valid: true,
        path,
        newBoard: finalBoard,
        completed,
      })
    }

    return NextResponse.json({
      success: true,
      valid: false,
      path: null,
    })
  } catch (error) {
    console.error('Validate move error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}