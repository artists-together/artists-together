import CursorScope from "./cursor-scope"

const ITEMS = [
  {
    href: "https://twitch.tv/channel",
    label: "Visit our Twitch channel",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.195 4 4 7.09v12.626h4.25V22h2.39l2.258-2.284h3.453L21 15.014V4H5.195Zm14.21 10.209-2.655 2.686H12.5l-2.258 2.284v-2.284H6.656V5.612h12.75v8.597ZM16.75 8.702v4.696h-1.594V8.702h1.594Zm-4.25 0v4.696h-1.594V8.702H12.5Z"
        />
      </svg>
    ),
  },
  {
    href: "https://discord.gg/server",
    label: "Join our Discord server",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
      >
        <path
          fill="currentColor"
          d="M19.219 5.29a16.556 16.556 0 0 0-4.194-1.317c-.18.327-.392.766-.537 1.115a15.397 15.397 0 0 0-4.648 0c-.145-.35-.36-.788-.543-1.115A16.5 16.5 0 0 0 5.1 5.294c-2.654 4.01-3.373 7.921-3.014 11.777a16.766 16.766 0 0 0 5.144 2.635c.414-.57.783-1.175 1.101-1.814a10.832 10.832 0 0 1-1.735-.844c.146-.108.288-.22.426-.336 3.344 1.564 6.978 1.564 10.283 0 .14.115.282.228.425.336-.55.331-1.132.616-1.738.846.319.637.686 1.244 1.102 1.814a16.73 16.73 0 0 0 5.146-2.637c.423-4.47-.72-8.345-3.021-11.78ZM8.787 14.7c-1.004 0-1.828-.938-1.828-2.079 0-1.142.806-2.08 1.828-2.08 1.021 0 1.845.937 1.827 2.08.002 1.141-.806 2.079-1.827 2.079Zm6.753 0c-1.004 0-1.827-.938-1.827-2.079 0-1.142.805-2.08 1.827-2.08 1.022 0 1.845.937 1.828 2.08 0 1.141-.806 2.079-1.828 2.079Z"
        />
      </svg>
    ),
  },
  {
    href: "https://instagram.com/your-profile",
    label: "Follow us on Instagram",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
      >
        <path
          fill="currentColor"
          d="M12 5.442c2.136 0 2.39.008 3.233.047 2.168.098 3.181 1.127 3.28 3.279.038.843.046 1.097.046 3.233s-.008 2.389-.046 3.232c-.1 2.15-1.11 3.181-3.28 3.28-.844.038-1.096.046-3.233.046-2.136 0-2.39-.008-3.233-.046-2.173-.1-3.18-1.133-3.279-3.28-.039-.844-.047-1.096-.047-3.233 0-2.136.009-2.389.047-3.233.1-2.151 1.11-3.18 3.28-3.279.843-.038 1.096-.046 3.232-.046ZM12 4c-2.173 0-2.445.01-3.298.048-2.905.133-4.52 1.745-4.653 4.653C4.009 9.555 4 9.827 4 12s.01 2.445.048 3.299c.133 2.905 1.745 4.52 4.653 4.653.854.039 1.126.048 3.299.048s2.445-.01 3.299-.048c2.902-.133 4.521-1.745 4.652-4.653.04-.854.049-1.126.049-3.299s-.01-2.445-.048-3.298c-.13-2.903-1.745-4.52-4.653-4.653C14.445 4.009 14.173 4 12 4Zm0 3.892a4.108 4.108 0 1 0 0 8.216 4.108 4.108 0 0 0 0-8.216Zm0 6.775a2.666 2.666 0 1 1 0-5.333 2.666 2.666 0 0 1 0 5.333Zm4.27-7.897a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92Z"
        />
      </svg>
    ),
  },
]

export default function Navigation() {
  return (
    <CursorScope
      as="nav"
      scope="navigation"
      role="navigation"
      aria-label="Social media links"
      className="fixed end-4 top-4 z-10 rounded-4 bg-outsider-violet-50 text-outsider-violet-800 shadow-button"
    >
      <ul className="flex items-center justify-center">
        {ITEMS.map((item, index) => (
          <CursorScope
            as="li"
            key={item.label}
            scope={index.toString()}
            className="size-12 flex-none"
          >
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="grid size-full place-items-center rounded-3.5 ring-2 ring-inset ring-outsider-violet-50 hover:bg-outsider-violet-300 active:ring-8"
            >
              {item.icon}
              <span className="sr-only">{item.label}</span>
            </a>
          </CursorScope>
        ))}
      </ul>
    </CursorScope>
  )
}
