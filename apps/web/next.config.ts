import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@saas/api-client",
    "@saas/design-tokens",
    "@saas/ui-web",
  ],
};

export default nextConfig;
