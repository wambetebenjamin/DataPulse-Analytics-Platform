/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 390, 768, 1024, 1200, 1440, 1920],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
