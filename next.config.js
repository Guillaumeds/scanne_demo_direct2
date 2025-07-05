/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is stable in Next.js 14, no experimental flag needed

  // Optimize for development stability
  webpack: (config, { dev }) => {
    if (dev) {
      // Reduce file watching sensitivity to prevent restart loops
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

module.exports = nextConfig
