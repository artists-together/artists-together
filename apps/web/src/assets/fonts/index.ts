import font from "next/font/local"

export const fraunces = font({
  variable: "--font-fraunces",
  display: "block",
  preload: true,
  declarations: [
    {
      prop: "SOFT",
      value: "100",
    },
  ],
  src: [
    {
      path: "./fraunces.woff2",
      style: "normal",
    },
  ],
})

export const inter = font({
  variable: "--font-inter",
  display: "block",
  preload: true,
  src: [
    {
      path: "./inter.woff2",
      style: "normal",
    },
  ],
})
