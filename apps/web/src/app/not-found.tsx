import { Metadata } from "next"
import Image from "next/image"
import image from "@/assets/images/404.png"

export const metadata: Metadata = {
  title: "404",
  description: "Oh no! This page doesn't exist.",
}

export default function NotFound() {
  return (
    <main className="relative h-dvh py-16 sm:py-4">
      <h1 className="sr-only">Oh no! This page doesn&apos;t exist.</h1>
      <Image
        src={image}
        draggable={false}
        alt=""
        className="mx-auto size-full max-w-[700px] object-contain"
      />
    </main>
  )
}
