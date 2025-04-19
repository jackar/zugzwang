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
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });

    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      util: false,
      buffer: false,
    };

    // Configure WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  }
}

module.exports = nextConfig 