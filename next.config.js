/** @type {import('next').NextConfig} */

const nextConfig = {
  /* Config options for production */
  output: 'standalone', // Optimized for hosting platforms like Render
  poweredByHeader: false, // Remove the `X-Powered-By: Next.js` header
  reactStrictMode: true,
  swcMinify: true,
  
  // Configure headers if needed
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 