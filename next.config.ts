import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/ai-vs-automation",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
