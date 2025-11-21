/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

  // Enable standalone output for Docker
  output: 'standalone',

  // Enable experimental features for better performance
  swcMinify: true,

  // Optimize images
  images: {
    unoptimized: true, // Required for standalone output
  },

  // Configure rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
