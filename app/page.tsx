'use client'

import { BsGithub } from "react-icons/bs";
import { MdMail, MdHome } from "react-icons/md";
import Link from "@/app/_components/Link";
import useUser from "@/app/_hooks/user";

export default function Page() {
  const [user, userLoaded] = useUser((state: any) => [state.user, state.loaded]);
  console.log('>> app.page.render()');

  return (
    <main className="flex flex-col items-center lg:max-w-4xl lg:mx-auto px-4">
      <h1 className="text-center">AI-powered app for workouts</h1>
      <div className="lg:self-center flex flex-col gap-4">
        <p>Let AI generate for you the perfect workouts!</p>
        <div className="flex flex-col gap-0">
          <p>&#8226;&nbsp;<Link href="/exercises" style="parent" className="group">Generate <Link style="child">exercises</Link></Link></p>
          <p>&#8226;&nbsp;<Link href="/workouts" style="plain" className="group">Track your <Link style="child">workouts</Link></Link></p>
          <p>&#8226;&nbsp;<Link href="/profile" style="plain" className="group">See your <Link style="child">profile</Link></Link></p>
        </div>
        {userLoaded && !user &&
          <p className="text-center"><Link href="/profile">Signup now!</Link></p>
        }
        {!(userLoaded && !user) &&
          <p className="text-center">More to come soon!</p>
        }
      </div>
      <div className="fixed left-0 lg:left-16 bottom-4 lg:bottom-6 w-full _bg-orange-300 flex flex-row justify-center gap-4">
        <Link href="https://www.desmat.ca" target="_blank" className="_bg-yellow-200 flex flex-row gap-1 align-text-bottom">
          <MdHome className="mt-1.5" />www.desmat.ca
        </Link>
        {/* <Link href="mailto:mail@desmat.ca" target="_blank" className="_bg-yellow-200 flex flex-row gap-1.5 align-text-bottom">
          <MdMail className="mt-1.5" />mail@desmat.ca
        </Link> */}
        <Link href="https://github.com/desmat" target="_blank" className="_bg-yellow-200 flex flex-row gap-1.5 align-text-bottom">
          <BsGithub className="mt-1.5" />github.com/desmat
        </Link>
      </div>
    </main>
  )
}
