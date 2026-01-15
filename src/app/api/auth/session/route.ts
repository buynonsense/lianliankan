import { NextResponse } from 'next/server'
import { getAuthCookie, verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/database/client'

export async function GET() {
  try {
    const token = await getAuthCookie()

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        totalScore: true,
        gamesPlayed: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user,
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const { clearAuthCookie } = await import('@/lib/auth/jwt')
  await clearAuthCookie()
  return NextResponse.json({ success: true })
}