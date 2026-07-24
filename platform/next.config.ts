import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default 1MB is too small for chart screenshots (uploadChart in
      // app/dashboard/actions.ts sends the file straight through a
      // Server Action rather than a separate upload endpoint).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
