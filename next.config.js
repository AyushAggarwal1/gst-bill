/** @type {import('next').NextConfig} */

// Force Prisma to use the classic/binary engine instead of the new "client" engine
// in ALL environments (dev and prod), so we don't need Accelerate or driver adapters.
// See: https://pris.ly/d/client-constructor
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';

const nextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // eslint: {
  //   // Warning: This allows production builds to successfully complete even if
  //   // your project has ESLint errors.
  //   ignoreDuringBuilds: true,
  // },
  reactStrictMode: true,
  output: 'standalone',
  serverExternalPackages: ['xlsx'],
  // Configure dynamic routes
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: '/api/:path*',
          has: [
            {
              type: 'header',
              key: 'Cache-Control',
              value: 'no-store',
            },
          ],
        },
      ],
    };
  },
  // Configure headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
        ],
      },
    ];
  },
};

module.exports = nextConfig; 