import type { NextConfig } from "next"

export default {
  output: "export",
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
} satisfies NextConfig
