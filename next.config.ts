import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "45mb",
    serverActions: {
      bodySizeLimit: "45mb",
    },
  },
  async redirects() {
    return [
      {
        destination: "/:slug",
        permanent: false,
        source: "/class/:slug",
      },
      {
        destination: "/:category",
        permanent: false,
        source: "/team/:category",
      },
    ];
  },
};

export default nextConfig;
