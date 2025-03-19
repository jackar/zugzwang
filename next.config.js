/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Disable cache in production builds
    config.cache = false
    config.module.rules.push({
      test: /\.pgn$/,
      type: 'asset/source',
      generator: {
        filename: 'static/[hash][ext]'
      }
    });
    return config;
  }
}

module.exports = nextConfig 