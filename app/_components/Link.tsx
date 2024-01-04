import { default as NextLink } from 'next/link'
import { Suspense } from 'react';
import ClientLink from './ClientLink';

export default function Link({
  children, href, className, onClick, style, title, target, useClient
}: {
  children: React.ReactNode,
  href?: string,
  className?: string,
  onClick?: (e?: any) => void,
  style?: string,
  title?: string,
  target?: string,
  useClient?: boolean
}) {
  // console.log('>> components.Link.render()', { isActive });

  const styleSet = new Set(style && style.split(/\s+/));
  const computedClassName = "  cursor-pointer"
    + (styleSet.has("parent") ? " group" : "")
    + (styleSet.has("child") ? " group-active:text-light-1 group-hover:underline" : "")
    + (!styleSet.has("plain") && !styleSet.has("secondary") && !styleSet.has("parent") ? " text-dark-2" : "")
    + (styleSet.has("plain") || styleSet.has("parent") ? " hover:no-underline" : " active:text-light-1")
    + (styleSet.has("secondary") ? " hover:text-dark-2 " : "")
    + (styleSet.has("warning") ? " hover:text-light-2 _px-1" : "")
    + (styleSet.has("light") ? " opacity-40 hover:opacity-100 group-hover:opacity-100" : "")
    + " " + className;

  if (styleSet.has("child")) {
    return (
      <span className={computedClassName}>
        {children}
      </span>
    )
  }

  if (useClient && onClick) {
    console.warn("Link component cannot have both useClient and onClick parameters");
  }

  if (useClient) {
    return (
      <NextLink
        href={href || "#"}
        title={title || ""}
        target={target || ""}
        className={computedClassName}
      >
        {children}
      </NextLink>
    )
  }

  return (
    <Suspense fallback=
      <NextLink
        href={href || "#"}
        title={title || ""}
        target={target || ""}
        className={computedClassName}
      >
        {children}
      </NextLink>
    >
      <ClientLink
        href={href || "#"}
        onClick={onClick}
        title={title || ""}
        target={target || ""}
        className={computedClassName}
      >
        {children}
      </ClientLink>
    </Suspense>
  )
}
