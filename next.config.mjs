/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Ensure static assets are properly served
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Configure public folder access
  publicRuntimeConfig: {
    staticFolder: '/public',
  },
  // Add this to help with static file serving
  trailingSlash: false,
}

export default nextConfig