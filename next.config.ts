import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  // 确保 Prisma 客户端正确解析
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '.prisma/client': require.resolve('./src/generated/prisma')
      }
    }
    return config;
  }
};

export default nextConfig;
