import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: "bottom-right",
  },
  images: {
    remotePatterns: [
      {
        hostname: "3lbm6vryvm.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
