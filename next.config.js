/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Adiciona resolução de alias para @/
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
  // Configurações otimizadas para deploy no Netlify com Server Components
  distDir: '.next',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
