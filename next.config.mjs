/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.CAPACITOR_BUILD ? 'export' : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    // We only perform redirects in a standard Node build (like Vercel).
    // Capacitor static exports do not support the redirects function.
    if (process.env.CAPACITOR_BUILD) {
      return [];
    }

    return [
      {
        has: [
          {
            type: 'host',
            value: 'gymsaverapp.com',
          },
        ],
        source: '/:path*',
        destination: 'https://www.gymsaverapp.com/:path*',
        permanent: true,
      },
    ];
  },
}

export default nextConfig
