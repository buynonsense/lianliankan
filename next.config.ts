import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  // Turbopack 配置（空配置以避免警告）
  turbopack: {}
};

export default nextConfig;
