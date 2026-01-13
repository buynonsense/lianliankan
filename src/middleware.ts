import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth')?.value

  // 保护需要认证的路由
  const protectedRoutes = ['/game', '/leaderboard', '/profile']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 允许请求继续
  return NextResponse.next()
}

export const config = {
  matcher: ['/game/:path*', '/leaderboard/:path*', '/profile/:path*'],
}