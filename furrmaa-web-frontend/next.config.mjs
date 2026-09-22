/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
  /**
   * Hostinger VPS: set BACKEND_INTERNAL_URL=http://127.0.0.1:5000
   * and NEXT_PUBLIC_API_SAME_ORIGIN=true so browser hits /api on same host
   * (Next proxies to local Node — lowest latency, no CORS).
   */
  async rewrites() {
    const backend = String(process.env.BACKEND_INTERNAL_URL || '').trim().replace(/\/$/, '');
    if (!backend) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
