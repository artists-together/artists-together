import "@/styles/index.css"
import clsx from "clsx"
import type { Metadata } from "next"
import * as fonts from "@/assets/fonts"
import Cursor from "@/components/cursor"

export const metadata: Metadata = {
  title: {
    default: "Artists Together",
    template: "Artists Together – %s",
  },
  description: "An inclusive community for all kinds of artists.",
  keywords: ["art", "artist community"],
  openGraph: {
    title: "Artists Together",
    description: "An inclusive community for all kinds of artists.",
    siteName: "Artists Together",
    locale: "en",
    type: "website",
  },
}

export default function Layout(props: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="scroll-smooth bg-arpeggio-black-900 text-outsider-violet-50"
    >
      <head>
        <noscript>
          <style>{/* TODO: rever initial text animation state here */}</style>
        </noscript>
      </head>
      <body
        className={clsx(
          "antialiased",
          Object.values(fonts).map((font) => font.variable),
        )}
      >
        <div className="pointer-events-none fixed inset-0 isolate bg-gradient-to-b from-[rgba(11,14,30,0)] from-25% to-[#2b0049]" />
        {props.children}
        <Cursor />
      </body>
    </html>
  )
}
