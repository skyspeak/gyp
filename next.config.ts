import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // These pages were folded into others. The URLs are already in the wild —
  // in the acquisition write-up, in sent email, and in the .ics feed — so they
  // redirect rather than 404. The pages are gone either way; this only decides
  // whether an existing link lands somewhere useful.
  async redirects() {
    return [
      { source: "/deadlines", destination: "/programs?sort=deadline", permanent: true },
      { source: "/gallery", destination: "/design", permanent: true },
      { source: "/changes", destination: "/programs?status=changed", permanent: true },
      { source: "/status", destination: "/programs", permanent: true },
    ];
  },
};

export default nextConfig;
