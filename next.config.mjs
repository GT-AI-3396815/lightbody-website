/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/lightbody-website',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
};

export default nextConfig;
