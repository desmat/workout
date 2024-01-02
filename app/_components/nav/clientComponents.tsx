'use client'

import { default as ReactLink } from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Fragment } from 'react'
import { FaUserCircle } from 'react-icons/fa';
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import useAlert from "@/app/_hooks/alert";
import useUser from '@/app/_hooks/user'; 
import useWorkouts from "@/app/_hooks/workouts";
import classNames from '@/utils/classNames'
import { menuItems } from "./menuItems";
import { handleGenerateWorkout } from '@/app/_utils/handlers';
import Link from '../Link';

export function NavLinks() {
  const pathname = usePathname();
  const [user] = useUser((state: any) => [state.user]);
  const [createWorkout, generateWorkout] = useWorkouts((state: any) => [state.createWorkout, state.generateWorkout]);
  const router = useRouter();
  const [info, success] = useAlert((state: any) => [state.info, state.success]);

  return (
    <div className="flex flex-grow flex-row lg:flex-col space-x-4 lg:space-x-0 pl-2 pr-0 py-2 lg:py-0 lg:px-2 -mx-2 -my-0 lg:mx-0 lg:-my-2 _bg-yellow-100">
      {menuItems({ pathname, user, router, createWorkout, generateWorkout, info, success }).map((menuItem: any) => (
        <div key={menuItem.name}>
          <NavLink
            className={`_bg-pink-300 hidden md:flex ${menuItem.className}`}
            title={menuItem.title}
            href={menuItem.href}
            isActive={menuItem.isActive}
            onClick={menuItem.onClick}
          >
            {menuItem.icon}
            <div className="my-auto">{menuItem.name}</div>
          </NavLink>
        </div>
      ))}
      <NavPopup />
    </div>
  )
}

// adapted from https://tailwindui.com/components/application-ui/elements/dropdowns
export function NavPopup() {
  const pathname = usePathname();
  const [user] = useUser((state: any) => [state.user]);
  const [createWorkout, generateWorkout] = useWorkouts((state: any) => [state.createWorkout, state.generateWorkout]);
  const router = useRouter();
  const [info, success] = useAlert((state: any) => [state.info, state.success]);

  // console.log('>> components.NavComponents.NavPopup.render()', { user });

  return (
    <div className="foobar md:hidden mt-1">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="flex items-center rounded-full -ml-14 text-slate-300 hover:text-slate-100">
            <span className="sr-only">Open options</span>
            <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
            {/* <Bars3Icon className="h-6 w-6" aria-hidden="true" /> */}
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute -left-16 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1" >
              {menuItems({ pathname, user, router, createWorkout, generateWorkout, info, success }).map((menuItem: any) => (
                <div
                  key={menuItem.name}
                  className="_bg-yellow-300">
                  <Menu.Item>
                    {({ active, close }) => (
                      <ReactLink
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm'
                        )}
                        title={menuItem.title}
                        href={menuItem.href || ""}
                        onClick={() => {
                          if (menuItem.onClick) {
                            if (menuItem.onClick()) {
                              close();
                            }
                          } else {
                            close();
                          }
                        }}
                      >
                        <NavLink
                          className={`_bg-pink-300 ${menuItem.className}`}
                          isMenu={true}
                          isActive={menuItem.isActive}
                          href={menuItem.href || ""}
                          onClick={() => {
                            if (menuItem.onClick) {
                              if (menuItem.onClick()) {
                                close();
                              }
                            } else {
                              close();
                            }
                          }}
                        >
                          {menuItem.icon}
                          <div className="my-auto">{menuItem.name}</div>
                        </NavLink>
                      </ReactLink>
                    )}
                  </Menu.Item>
                </div>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}

function NavLink({
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
    <div className="flex w-max" title={title}
      onClick={() => onClick && onClick()}
    >
      <ReactLink
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
      </ReactLink>
    </div>
  )
}

export function NavProfileLink({
  href, className,
}: {
  href: string,
  className?: string,
}) {
  // console.log('>> components.PostNaProfileNavLinkvLink.render()');
  const pathname = usePathname();
  const [user] = useUser((state: any) => [state.user]);
  const isActive = href && (href == "/" && pathname == "/") || (href && href != "/" && pathname.startsWith(href));
  const isLoggedIn = user && user.uid && !user.isAnonymous;
  const photoURL = isLoggedIn && user?.photoURL || "";

  return (
    <ReactLink
      href={href}
      title={user ? user.isAnonymous ? "(Anonymous)" : user.displayName as string : "(Not logged in)"}
      className={(isActive ? "text-slate-100" : "text-slate-300") + " flex flex-auto ellipsis whitespace-nowrap lg:whitespace-normal space-x-2 h-full lg:h-fit -my-0.5 lg:my-0 mx-1 lg:mx-auto hover:text-slate-100 align-middle text-ellipsis " + className}
    >
      {!photoURL && <FaUserCircle className="my-auto h-7 w-7 lg:h-12 lg:w-12 " />}
      {user && photoURL && <img className="rounded-full h-7 w-7 lg:h-12 lg:w-12" src={photoURL}></img>}
    </ReactLink>
  )
}


export function GenerateLink({
  children, href, className, /* onClick, */ style, title, target
}: {
  children: React.ReactNode,
  href?: string,
  className?: string,
  // onClick?: (e?: any) => void,
  style?: string,
  title?: string,
  target?: string,
}) {
  // console.log('>> components.Nav.GenerateLink()', { isActive });
  const [user] = useUser((state: any) => [state.user]);
  const [generateWorkout] = useWorkouts((state: any) => [state.createWorkout, state.generateWorkout]);
  const router = useRouter();
  const [info, success] = useAlert((state: any) => [state.info, state.success]);

  return (
    <Link
      href={href}
      className={className}
      style={style}
      title={title}
      target={target}
      onClick={() => {
        if (user) {
          handleGenerateWorkout(generateWorkout, router, user, info, success)
          router.push(`/workouts?uid=${user?.uid || ""}`);
        }
      }}
    >
      {children}
    </Link>
  )
}
