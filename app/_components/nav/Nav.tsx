import Link from 'next/link'
import { Suspense } from 'react';
import { FaRegUserCircle } from 'react-icons/fa';
import { NavProfileLink, NavLinks as ClientNavLinks } from "./clientComponents";
import { menuItems } from "./menuItems";

export default async function Nav() {
  return (
    <div className="bg-dark-1 text-dark-3 fixed z-10 w-full h-10 lg:w-32 lg:h-screen flex flex-row lg:flex-col">
      <div className="flex flex-grow-0 p-2 -ml-1 lg:ml-0 lg:-mt-1">
        <NavLink href="/" className="_bg-yellow-600 hover:no-underline">
          <div className="Logo my-auto">Workout</div>
        </NavLink>
      </div>
      <Suspense
        fallback={<NavLinks />}
      >
        <ClientNavLinks />
      </Suspense>
      <div className="flex flex-col p-2 -mr-1 lg:mr-0 lg:-mb-1">
        <Suspense
          fallback={<NavNotLoggedInLink />}
        >
          <NavProfileLink href="/profile" className="_bg-orange-600" />
        </Suspense>
      </div>
    </div>
  )
}

function NavLinks() {
  return (
    <div className="flex flex-grow flex-row lg:flex-col space-x-4 lg:space-x-0 pl-2 pr-0 py-2 lg:py-0 lg:px-2 -mx-2 -my-0 lg:mx-0 lg:-my-2 _bg-yellow-100">
      {menuItems({}).map((menuItem: any) => (
        <div key={menuItem.name}>
          <NavLink
            className={`_bg-pink-300 hidden md:flex ${menuItem.className}`}
            title={menuItem.title}
            href={menuItem.href}
            isActive={menuItem.isActive}
          >
            {menuItem.icon}
            <div className="my-auto">{menuItem.name}</div>
          </NavLink>
        </div>
      ))}
        {/* <NavPopup /> */}
    </div>
  )
}

function NavLink({
  children, href, className, title, isMenu, isActive,
}: {
  children: React.ReactNode,
  href?: string,
  className?: string,
  title?: string
  isMenu?: boolean,
  isActive?: boolean
}) {
  // console.log('>> components.NavLink.render()', { isActive });

  return (
    <div className="flex w-max" title={title}
    // onClick={() => onClick && onClick()}
    >
      <Link
        href={href || "#"}
        className={(
          isActive
            ? (isMenu ? "text-dark-1" : "text-slate-100")
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

async function NavNotLoggedInLink() {
  return (
    <Link
      title="(Not logged in)"
      href=""
      className={("text-slate-300") + " flex flex-auto ellipsis whitespace-nowrap lg:whitespace-normal space-x-2 h-full lg:h-fit -my-0.5 lg:my-0 mx-1 lg:mx-auto hover:text-slate-100 align-middle text-ellipsis "}
    >
      <FaRegUserCircle className="my-auto h-7 w-7 lg:h-12 lg:w-12" />
    </Link>
  )
}
