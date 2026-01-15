import { NextResponse } from 'next/server'

// 健康检查可以缓存一小段时间
export const revalidate = 60

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'lianliankan-game',
  })
}