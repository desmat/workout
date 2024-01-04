'use client'

import { default as NextLink } from 'next/link'

export default function ClientLink({
  children, href, className, onClick, style, title, target
}: {
  children: React.ReactNode,
  href?: string,
  className?: string,
  onClick?: (e?: any) => void,
  style?: string,
  title?: string,
  target?: string,
}) {
  // console.log('>> components.Link.render()', { isActive });

  const styleSet = new Set(style && style.split(/\s+/));
  const computedClassName = className;

  if (styleSet.has("child")) {
    return (
      <span className={computedClassName}>
        {children}
      </span>
    )
  }

  return (
    <NextLink
      href={href || "#"}
      onClick={(e) => { if (onClick) { e.preventDefault(); onClick(e); } else if (!href) { e.preventDefault(); } }}
      title={title || ""}
      target={target || ""}
      className={computedClassName}
    >
      {children}
    </NextLink>
  )
}
