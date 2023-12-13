'use client'

import { User } from "firebase/auth";
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react';
import { BsFillPlusCircleFill } from "react-icons/bs"
import { BsLightningFill } from "react-icons/bs"
import { BsClipboardFill } from "react-icons/bs"
import { BsCupHotFill } from "react-icons/bs";
import { BsFillQuestionSquareFill } from 'react-icons/bs'
import NavLink from '@/app/_components/NavLink'
import NavProfileLink from '@/app/_components/NavProfileLink'
import NavPopup from '@/app/_components/NavPopup'
import useUser from '@/app/_hooks/user';

function isActive(pathname: string, href: string): boolean {
  return (href && (href == "/" && pathname == "/") || (href && href != "/" && pathname.startsWith(href))) as boolean;
}

function getUsername(user: User | undefined) {
  if (!user) return "";

  return user?.isAnonymous ? "Anonymous" : user?.displayName || user?.email || "Noname";
}

function menuItems({ pathname, user, router }: { pathname: string, user: User | undefined, router: any | undefined }) {
  return [
    {
      name: "Exercises",
      href: "/exercises",
      icon: <BsLightningFill className="my-auto text-right" />
    },
    {
      name: "Workouts",
      href: "/workouts",
      icon: <BsClipboardFill className="my-auto" />
    },
    {
      name: "Create",
      icon: <BsFillPlusCircleFill className="my-auto" />,
      title: user ? "Create a new workout" : "Login to create workouts",
      className: user ? "" : "cursor-not-allowed",
      onClick: async function () {
        if (user) {
          const content = window.prompt("Somethingsomething", "something");
          if (content) {
            console.log("Something!", { content });
            // const userName = getUsername(user);
            // const post = await addPost(content, userName, user?.uid);
            // router.push("/posts");
            // return post as boolean;
          }

          return false;
        }
      }
    },
  ].map((menuItem: any) => {
    menuItem.isActive = isActive(pathname, menuItem.href);
    return menuItem;
  });
}

export default function Nav() {
  const pathname = usePathname();
  const [user] = useUser((state: any) => [state.user]);
  const router = useRouter();

  return (
    <div className="bg-teal-600 text-slate-300 fixed z-10 w-full h-10 lg:w-32 lg:h-screen flex flex-row lg:flex-col">
      <div className="flex flex-grow-0 p-2 -ml-1 lg:ml-0 lg:-mt-1">
        <NavLink href="/" className="_bg-yellow-600 hover:no-underline">
          <div className="Logo my-auto">Workout</div>
        </NavLink>
      </div>
      <div className="flex flex-grow flex-row lg:flex-col space-x-4 lg:space-x-0 pl-2 pr-0 py-2 lg:py-0 lg:px-2 -mx-2 -my-0 lg:mx-0 lg:-my-2 _bg-yellow-100">
        {menuItems({ pathname, user, router }).map((menuItem: any) => (
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
          <NavPopup menuItems={menuItems({ pathname, user, router })} />
        </div>
      </div>
      <div className="flex flex-col p-2 -mr-1 lg:mr-0 lg:-mb-1">
        <NavProfileLink href="/profile" className="_bg-orange-600" />
      </div>
    </div>
  )
}
