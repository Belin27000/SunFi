import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Ignore les erreurs ESLint pendant la construction
  },
};

export default nextConfig;
