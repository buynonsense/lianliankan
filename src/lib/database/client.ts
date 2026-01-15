import { PrismaClient } from '@/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 创建 Prisma 客户端实例
const createPrismaClient = () => {
  return new PrismaClient({
    // 在开发环境显示查询日志
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// 使用全局实例避免多个实例（Serverless 环境重要）
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 确保在生产环境中也使用全局实例
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}