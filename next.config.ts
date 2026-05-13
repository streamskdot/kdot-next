import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  headers: async () => {
    return [
      {
        source: '/match/:path*/opengraph-image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=86400, immutable' }
        ]
      }
    ]
  }
};

export default nextConfig;
