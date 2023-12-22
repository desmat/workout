'use client'

import { BsGithub } from "react-icons/bs";
import { MdMail, MdHome } from "react-icons/md";
import Link from "@/app/_components/Link";
import Page from "@/app/_components/Page";
import useUser from "@/app/_hooks/user";

export default function Component() {
  const [user, userLoaded] = useUser((state: any) => [state.user, state.loaded]);
  console.log('>> app.page.render()');

  const links = [
    <Link key="0" href="https://www.desmat.ca" target="_blank" className="_bg-yellow-200 flex flex-row gap-1 align-text-bottom">
      <MdHome className="mt-[5px]" />www.desmat.ca
    </Link>,
    // <Link key="1" href="mailto:mail@desmat.ca" target="_blank" className="_bg-yellow-200 flex flex-row gap-1.5 align-text-bottom">
    //   <MdMail className="mt-1.5" />mail@desmat.ca
    // </Link>,
    <Link key="2" href="https://github.com/desmat" target="_blank" className="_bg-yellow-200 flex flex-row gap-1.5 align-text-bottom">
      <BsGithub className="mt-1.5" />github.com/desmat
    </Link>,
  ];

  return (
    <Page
      title="AI-powered app for workouts"
      bottomLinks={links}
    >
      <div className="lg:self-center flex flex-col gap-4">
        <p>Let AI generate for you the perfect workouts!</p>
        <div className="flex flex-col gap-0">
          <p>&#8226;&nbsp;<Link href="/exercises" style="parent" className="group">Create <Link style="child">exercises</Link> and review AI-generated instructions and variations</Link></p>
          <p>&#8226;&nbsp;<Link href="/workouts" style="plain" className="group">Prepare and track your own <Link style="child">workouts</Link></Link></p>
          <p>&#8226;&nbsp;<Link href="/profile" style="plain" className="group"><Link style="child">Sign-in</Link> to keep track of your progress</Link></p>
        </div>
        {userLoaded && !user &&
          <p className="text-center"><Link href="/profile">Signup now!</Link></p>
        }
        {!(userLoaded && !user) &&
          <p className="text-center">More to come soon!</p>
        }
      </div>
    </Page>
  )
}
