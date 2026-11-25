import type { NextConfig } from 'next';

const adminApiOrigin = process.env.ADMIN_API_ORIGIN?.replace(/\/+$/, '');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  async rewrites() {
    if (!adminApiOrigin) return [];
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${adminApiOrigin}/:path*`,
      },
    ];
  },
  // Emailed access links open `<orderTrackingPath>?orderId=...&token=...`;
  // send them to the order hub (other query params are forwarded).
  async redirects() {
    return [
      {
        source: '/orders',
        has: [{ type: 'query', key: 'orderId', value: '(?<orderId>[^/]+)' }],
        destination: '/orders/:orderId',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
