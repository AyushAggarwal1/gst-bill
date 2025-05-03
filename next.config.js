/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [], // Add any image domains you need
  },
  poweredByHeader: false,
};

module.exports = nextConfig; 