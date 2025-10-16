import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable compression
  compress: true,
  // Power page optimization
  poweredByHeader: false,
  // Optimize builds
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb", // for images, videos
    },
    // Enable optimized package imports
    optimizePackageImports: ["@react-jvectormap/core", "swiper", "react-apexcharts"],
  },
  // Production optimizations
  productionBrowserSourceMaps: false,
};

export default nextConfig;
