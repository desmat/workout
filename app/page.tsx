import { BsGithub } from "react-icons/bs";
import { MdMail, MdHome } from "react-icons/md";
import { GenerateLink, SignupOrWhatever } from "@/app/_components/HomePage";
import Link from "@/app/_components/Link"
import Page from "@/app/_components/Page";

export default function Component() {
  console.log('>> app.page.render()');

  const links = [
    <Link useClient={true} key="0" href="https://www.desmat.ca" target="_blank" className="_bg-yellow-200 flex flex-row gap-1 align-text-bottom">
      <MdHome className="mt-[5px]" />www.desmat.ca
    </Link>,
    // <Link key="1" href="mailto:mail@desmat.ca" target="_blank" className="_bg-yellow-200 flex flex-row gap-1.5 align-text-bottom">
    //   <MdMail className="mt-1.5" />mail@desmat.ca
    // </Link>,
    <Link useClient={true} key="2" href="https://github.com/desmat" target="_blank" className="_bg-yellow-200 flex flex-row gap-1.5 align-text-bottom">
      <BsGithub className="mt-1.5" />github.com/desmat
    </Link>,
  ];

  return (
    <Page
      title="AI-powered app for workouts"
      subtitle="Let AI generate for you the perfect workouts!"
      bottomLinks={links}
    >
      <div className="self-center flex flex-col gap-1 my-2">
        <p>
          &#8226;&nbsp;
          <Link useClient={true} href="/exercises" style="parent" className="group">
            Create <Link useClient={true} style="child" className="font-semibold">exercises</Link> and review AI-generated instructions and variations
          </Link>
        </p>
        <p>
          &#8226;&nbsp;
          <Link useClient={true} href="/workouts" style="plain" className="group">
            Prepare and track your own <Link useClient={true} style="child" className="font-semibold">workouts</Link>
          </Link>,
          <GenerateLink style="plain" className="group">
            &nbsp;or let our AI <Link useClient={true} style="child" className="font-semibold">generate</Link> a tailor made one for you!
          </GenerateLink>
        </p>
        <p>&#8226;&nbsp;<Link useClient={true} href="/profile" style="plain" className="group">
          <Link useClient={true} style="child" className="font-semibold">Sign-in</Link> to keep track of your progress
        </Link>
        </p>
      </div>
      <div className="my-6 text-center">
        <SignupOrWhatever
          signup={<Link useClient={true} href="/profile" className="font-semibold">Signup now!</Link>}
          whatever={<>More to come soon!</>}
        />
      </div>
    </Page>
  )
}
