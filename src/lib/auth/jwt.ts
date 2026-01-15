import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// JWT_SECRET 环境变量
// 在生产环境中强烈建议设置 JWT_SECRET，但允许构建过程通过
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-for-local-development-only'
const JWT_EXPIRES_IN = '7d'

interface JWTPayload {
  userId: number
  username: string
}

export async function createToken(payload: JWTPayload): Promise<string> {
  // 运行时检查（仅在生产环境）
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.warn('⚠️  Warning: JWT_SECRET environment variable is not set. Using fallback secret.')
  }

  const secret = new TextEncoder().encode(JWT_SECRET)

  return await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .setSubject(payload.userId.toString())
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    // 运行时检查（仅在生产环境）
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      console.warn('⚠️  Warning: JWT_SECRET environment variable is not set.')
    }

    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    return {
      userId: parseInt(payload.sub!),
      username: payload.username as string,
    }
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('auth')?.value
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth')
}