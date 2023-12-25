'use client'

import { User } from "firebase/auth";
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Fragment } from 'react'
import { BsFillPlusCircleFill } from "react-icons/bs"
import { FaRegUserCircle, FaUserCircle, FaRunning } from 'react-icons/fa';
import { LuDumbbell } from "react-icons/lu";
import { Menu, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import useUser from '@/app/_hooks/user';
import useWorkouts from "@/app/_hooks/workouts";
import { handleCreateWorkout } from "@/app/workouts/page";
import classNames from '@/utils/classNames'

function menuItems({ pathname, user, router, createWorkout }: { pathname: string, user: User | undefined, router: any | undefined, createWorkout: any | undefined }) {
  return [
    {
      name: "Exercises",
      href: "/exercises",
      icon: <LuDumbbell className="my-auto text-right" />
    },
    {
      name: "Workouts",
      href: "/workouts",
      icon: <FaRunning className="my-auto" />
    },
    {
      name: "Create",
      icon: <BsFillPlusCircleFill className="my-auto" />,
      title: user ? "Create a new workout" : "Login to create workouts",
      className: user ? "" : "cursor-not-allowed",
      onClick: () => user && handleCreateWorkout(createWorkout, router, user)
    },
  ].map((menuItem: any) => {
    menuItem.isActive = isActive(pathname, menuItem.href);
    return menuItem;
  });
}

function isActive(pathname: string, href: string): boolean {
  return (href && (href == "/" && pathname == "/") || (href && href != "/" && pathname.startsWith(href))) as boolean;
}

export default function Nav() {
  const pathname = usePathname();
  const [user] = useUser((state: any) => [state.user]);
  const [createWorkout] = useWorkouts((state: any) => [state.createWorkout]);
  const router = useRouter();

  return (
    <div className="bg-dark-1 text-dark-3 fixed z-10 w-full h-10 lg:w-32 lg:h-screen flex flex-row lg:flex-col">
      <div className="flex flex-grow-0 p-2 -ml-1 lg:ml-0 lg:-mt-1">
        <NavLink href="/" className="_bg-yellow-600 hover:no-underline">
          <div className="Logo my-auto">Workout</div>
        </NavLink>
      </div>
      <div className="flex flex-grow flex-row lg:flex-col space-x-4 lg:space-x-0 pl-2 pr-0 py-2 lg:py-0 lg:px-2 -mx-2 -my-0 lg:mx-0 lg:-my-2 _bg-yellow-100">
        {menuItems({ pathname, user, router, createWorkout }).map((menuItem: any) => (
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
        <div className="md:hidden mt-1">
          <NavPopup menuItems={menuItems({ pathname, user, router, createWorkout })} />
        </div>
      </div>
      <div className="flex flex-col p-2 -mr-1 lg:mr-0 lg:-mb-1">
        <NavProfileLink href="/profile" className="_bg-orange-600" />
      </div>
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
    <div className="flex w-max" title={title} onClick={() => onClick && onClick()}>
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

// adapted from https://tailwindui.com/components/application-ui/elements/dropdowns
function NavPopup({
  menuItems,
}: {
  menuItems: any,
}) {
  return (
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
            {menuItems && menuItems.map((menuItem: any) => (
              <div 
                key={menuItem.name} 
                className="_bg-yellow-300">
                <Menu.Item>
                  {({ active, close }) => (
                    <Link
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
                    </Link>
                  )}
                </Menu.Item>
              </div>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

function NavProfileLink({
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
  const photoURL = isLoggedIn && user.photoURL;

  return (
    <Link 
      href={href} 
      title={user ? user.isAnonymous ? "(Anonymous)" : user.displayName as string : "(Not logged in)"}
      className={(isActive ? "text-slate-100" : "text-slate-300") + " flex flex-auto ellipsis whitespace-nowrap lg:whitespace-normal space-x-2 h-full lg:h-fit -my-0.5 lg:my-0 mx-1 lg:mx-auto hover:text-slate-100 align-middle text-ellipsis " + className}
    >
      {!user && <FaRegUserCircle className="my-auto h-7 w-7 lg:h-12 lg:w-12" />}
      {user && !photoURL && <FaUserCircle className="my-auto h-7 w-7 lg:h-12 lg:w-12 " />}
      {user && photoURL && <img className="rounded-full h-7 w-7 lg:h-12 lg:w-12" src={photoURL as string | undefined}></img>}
      {/* {!user &&
        <div className="overflow-hidden text-ellipsis max-w-[160px] lg:max-w-[90px] whitespace-nowrap">(Not logged in)</div>
      }
      {user &&
        <div className="overflow-hidden text-ellipsis max-w-[160px] lg:max-w-[90px] whitespace-nowrap" title={user.uid}>{user.isAnonymous ? "(Anonymous)" : user.displayName}</div>
      } */}
    </Link>
  )
}
