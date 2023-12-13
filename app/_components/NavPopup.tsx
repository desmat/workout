'use client'

// adapted from https://tailwindui.com/components/application-ui/elements/dropdowns

import { Menu, Transition } from '@headlessui/react'
import { Bars3Icon, EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import classNames from '@/utils/classNames'
import NavLink from './NavLink'
import Link from 'next/link'

function isActive(pathname: string, href: string): boolean {
  return (href && (href == "/" && pathname == "/") || (href && href != "/" && pathname.startsWith(href))) as boolean;
}

export default function NavPopup({
  menuItems,
}: {
  menuItems: any,
}) {
  const pathname = usePathname();

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
