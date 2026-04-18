import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/api-contracts", "@repo/auth", "@repo/marketing", "@repo/shared"],
};

export default nextConfig;
