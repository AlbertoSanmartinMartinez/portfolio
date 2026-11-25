import type { NextConfig } from "next";

// Security headers for every response (specs/003, AC-7) and the deployed version (AC-1).
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // A self-contained server for the container image (Dockerfile).
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders, { key: "x-app-version", value: process.env.APP_VERSION ?? "dev" }],
      },
    ];
  },
};

export default nextConfig;
