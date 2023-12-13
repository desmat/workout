import { default as NextLink } from 'next/link'

export default function Link({
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
  // console.log('>> components.NavLink.render()', { isActive });

  const styleSet = new Set(style && style.split(/\s+/));
  const computedClassName = "  cursor-pointer"
    + (styleSet.has("parent") ? " group" : "")
    + (styleSet.has("child") ? " group-active:text-light-1 group-hover:underline" : "")
    + (!styleSet.has("plain") && !styleSet.has("secondary") && !styleSet.has("parent") ? " text-dark-2" : "")
    + (styleSet.has("plain") || styleSet.has("parent") ? " hover:no-underline" : " active:text-light-1")
    + (styleSet.has("secondary") ? " hover:text-dark-2 " : "")
    + (styleSet.has("warning") ? " hover:text-light-2 _px-1" : "")
    + (styleSet.has("light") ? " opacity-40 hover:opacity-100 group-hover:opacity-100" : "")
    + " " + className


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
