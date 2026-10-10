import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" }
    ]
  },
  experimental: {
    // The proxy buffers request bodies; raise the 10MB default so 15MB asset
    // uploads are not truncated.
    proxyClientMaxBodySize: '16mb',
  },
};

export default nextConfig;
