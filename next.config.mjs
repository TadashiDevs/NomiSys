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
  // Configuración para Docker deployment con standalone output
  output: 'standalone',
  // Configuración para mejorar el rendimiento
  experimental: {
    optimizeServerReact: true,
  },
  // Configuración para mejorar el manejo de WebAssembly
  webpack: (config) => {
    // Optimizar la carga de WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Configurar caché para recursos estáticos
    config.cache = true;

    return config;
  },
}

export default nextConfig
