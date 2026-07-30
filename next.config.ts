import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds the server-free GitHub Pages preview (see
// scripts/build-pages.ps1); the normal build keeps the full app.
const isStatic = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  // A stray lockfile exists in the parent dir (Z:\code); pin the workspace
  // root so Turbopack doesn't infer the wrong one.
  turbopack: {
    root: __dirname,
  },
  ...(isStatic
    ? {
        output: "export" as const,
        basePath: "/lsc-furniture",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
