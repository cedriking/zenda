const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    const r2PublicUrl = process.env.R2_UPDATES_PUBLIC_URL || 'https://pub-xxx.r2.dev';
    return [
      {
        source: '/updates/:path*',
        destination: `${r2PublicUrl}/updates/:path*`,
      },
    ];
  },
}

module.exports = withNextIntl(nextConfig)
