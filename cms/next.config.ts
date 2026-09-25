import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { unoptimized: true },
  // Preview hosts (e2b) and local dev. Do not set X-Frame-Options here:
  // the hosted preview loads this app in an iframe.
  allowedDevOrigins: ["*.e2b.app", "*.e2b.dev"],
  async rewrites() {
    return [{ source: "/:file(google[0-9A-Za-z_-]+\\.html)", destination: "/api/gsc-file?file=:file" }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
    ];
  },
};

export default nextConfig;
