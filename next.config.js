/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
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