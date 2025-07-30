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
  },
  experimental: {
    allowedDevOrigins: [
      '192.168.100.110',
      '192.168.1.*',
      '192.168.0.*',
      '10.0.0.*',
      'localhost',
      '127.0.0.1'
    ]
  }
}

export default nextConfig
