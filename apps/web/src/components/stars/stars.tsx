import dynamic from "next/dynamic"

const StarsComponent = dynamic(() => import("./stars-component"), {
  ssr: false,
})

export default function Stars() {
  return <StarsComponent />
}
