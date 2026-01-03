/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilitar algumas regras do ESLint que podem causar problemas
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Configurações de imagens
  images: {
    unoptimized: true, // Para evitar problemas com imagens estáticas
    domains: ['localhost'], // Adicionar domínios de produção aqui
    formats: ['image/webp', 'image/avif'],
  },
  
  // Configurações de output
  output: 'standalone',
  
  // Configuração para resolver o aviso sobre múltiplos lockfiles
  outputFileTracingRoot: __dirname,
  
  // Configurações de experimental
  experimental: {
    optimizePackageImports: ['@/components'],
  },
  
  // Configurações de servidor
  serverExternalPackages: ['pg'],
  
  // Configurações de webpack
  webpack: (config, { isServer }) => {
    // Ignorar Edge Functions (Deno) do build do Next.js
    // A exclusão é feita via tsconfig.json, aqui só garantimos que não processe
    
    // Otimizações para o cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Configurações de segurança para produção
    if (process.env.NODE_ENV === 'production') {
      // Remover console.log em produção
      config.optimization.minimizer.forEach((minimizer) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions.compress.drop_console = true;
        }
      });
    }
    
    return config;
  },
  
  // Configurações de headers de segurança adicionais
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';

    return [
      {
        // Aplicar a todas as rotas
        source: '/(.*)',
        headers: [
          // Headers adicionais de segurança
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate, noindex, nofollow',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          {
            key: 'X-Download-Options',
            value: 'noopen',
          },
          // Cache control condicionado ao ambiente
          {
            key: 'Cache-Control',
            value: isProd
              ? 'public, max-age=31536000, immutable'
              : 'no-store',
          },
        ],
      },
      {
        // Headers específicos para APIs
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        // Headers para arquivos estáticos
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isProd
              ? 'public, max-age=31536000, immutable'
              : 'no-store',
          },
        ],
      },
    ];
  },
  
  // Configurações de redirecionamento
  async redirects() {
    return [
      // Redirecionar HTTP para HTTPS em produção
      ...(process.env.NODE_ENV === 'production' ? [
        {
          source: '/:path*',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http',
            },
          ],
          destination: 'https://:path*',
          permanent: true,
        },
      ] : []),
    ];
  },
};

module.exports = nextConfig;
