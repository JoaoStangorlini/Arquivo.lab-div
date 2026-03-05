import type { NextConfig } from "next";
// Double-lock: Validate environment variables during Next.js config loading
// import "./src/env.mjs";

const nextConfig: NextConfig = {
  compress: true,
  devIndicators: false,
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.youtube.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'bqszadfunqgtfpaorwvx.supabase.co', pathname: '/**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
  transpilePackages: ['recharts'],
  async redirects() {
    return [
      { source: '/perfil', destination: '/lab', permanent: true },
      { source: '/comunidade', destination: '/colisor', permanent: true },
      { source: '/dms', destination: '/emaranhamento', permanent: true },
      { source: '/timeline', destination: '/fluxo', permanent: true },
      { source: '/guia', destination: '/manual', permanent: true },
    ];
  },
};

export default nextConfig;
