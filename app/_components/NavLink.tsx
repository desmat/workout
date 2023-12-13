'use client'

import Link from 'next/link'

export default function NavLink({
  children, href, className, title, isMenu, isActive, onClick,
}: {
  children: React.ReactNode,
  href?: string,
  className?: string,
  title?: string
  isMenu?: boolean,
  isActive?: boolean
  onClick?: () => void,
}) {
  // console.log('>> components.NavLink.render()', { isActive });

  return (
    <div className="flex w-max" title={title} onClick={() => onClick && onClick()}>
      <Link
        href={href || "#"}
        className={(
          isActive
            ? (isMenu ? "text-dark-3" : "text-slate-100")
            : (isMenu ? "text-dark-2" : "text-slate-300")
        ) + (isMenu
          ? ""
          : " hover:text-slate-100"
          ) + " flex flex-row ellipsis whitespace-nowrap lg:whitespace-normal space-x-2 h-full lg:h-fit my-0 lg:my-1 mx-1 lg:mx-0 align-middle " + className}
      >
        {children}
      </Link>
    </div>
  )
}
