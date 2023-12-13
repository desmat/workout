'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation'
import { FaRegUserCircle, FaUserCircle } from 'react-icons/fa';
import useUser from '@/app/_hooks/user';

export default function NavProfileLink({
  href, className,
}: {
  href: string,
  className?: string,
}) {
  console.log('>> components.PostNaProfileNavLinkvLink.render()');
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
