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
      title="AI-Powered Personal Trainer"
      subtitle="Perfect workout plans, just for you!"
      bottomLinks={links}
    >
      <div className="self-center flex flex-col gap-1 my-2">
        <p>
          <Link useClient={true} href="/exercises" style="plain" className="group">
            &#8226;&nbsp;Let AI help you with any <Link useClient={true} style="child" className="font-semibold">exercise</Link> and variation
          </Link>
        </p>
        <p>
        <GenerateLink style="plain" className="group">
          &#8226;&nbsp;<Link useClient={true} style="child" className="font-semibold">Generate</Link> your own personalized workout plans
          </GenerateLink>
        </p>
        <p>
          <Link useClient={true} href="/workouts" style="plain" className="group">
          &#8226;&nbsp;Customize your <Link useClient={true} style="child" className="font-semibold">workouts</Link> 
          </Link>
        </p>
        <p>
        <Link useClient={true} href="/profile" style="plain" className="group">
          &#8226;&nbsp;<Link useClient={true} style="child" className="font-semibold">Signup</Link> and track your progress over time
          </Link>
        </p>
        <p>
        &#8226;&nbsp;More to come soon!
        </p>
      </div>
      <div className="my-6 text-center">
        {/* <SignupOrWhatever
          signup={<Link useClient={true} href="/profile" className="font-semibold">Signup now!</Link>}
          whatever={<>More to come soon!</>}
        /> */}
        <Link useClient={true} href="mailto:workout@desmat.ca" style="plain" className="group">
        Your <Link useClient={true} style="child" className="font-semibold">feedback</Link> is appreciated 🙏
        </Link>
      </div>
    </Page>
  )
}
