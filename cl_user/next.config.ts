import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const internalApiUrl = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    return [
      {
        source: '/api-backend/:path*',
        destination: `${internalApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;

