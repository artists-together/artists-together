import type { NextConfig } from "next"

export default {
  output: "export",
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
} satisfies NextConfig
