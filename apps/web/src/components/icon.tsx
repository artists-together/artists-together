import { clsx } from "clsx"
import type { ComponentProps } from "react"
import type { IconName } from "../../public/icons/name"

type Props = Omit<ComponentProps<"svg">, "children"> & {
  src: IconName
  alt: string
}

export default function Icon({ src, alt, className, ...props }: Props) {
  return (
    <>
      <svg
        focusable={false}
        className={clsx(className, "pointer-events-none")}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        aria-hidden
        {...props}
      >
        <use href={`/icons/sprite.svg#${src}`} />
      </svg>
      {alt ? <span className="sr-only">{alt}</span> : null}
    </>
  )
}
