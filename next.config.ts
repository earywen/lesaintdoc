import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React 16.1 Cache Components (PPR)
  cacheComponents: true,

  // Optimisations de bundle
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // Images optimisées (Discord avatars)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com" },
    ],
  },

  // Logs de build plus clairs
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
