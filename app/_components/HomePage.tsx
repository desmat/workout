'use client'

// client-side components for the home page - this will allow us to render server side

import { usePathname, useRouter } from 'next/navigation'
import useAlert from "@/app/_hooks/alert";
import useUser from '@/app/_hooks/user';
import useWorkouts from "@/app/_hooks/workouts";
import { handleGenerateWorkout } from "@/app/_utils/handlers";
import Link from "./Link";

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
  const pathname = usePathname();
  const [user] = useUser((state: any) => [state.user]);
  const [createWorkout, generateWorkout] = useWorkouts((state: any) => [state.createWorkout, state.generateWorkout]);
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
          router.push("/workouts");
        }
      }}
    >
      {children}
    </Link>
  )
}

export function SignupOrWhatever({
  signup, whatever
}: {
  signup: React.ReactNode
  whatever: React.ReactNode
}) {
  const [user, userLoaded] = useUser((state: any) => [state.user, state.loaded]);
  const isSignedUp = userLoaded && user && !user.isAnonymous;

  if (!isSignedUp) {
    return ( signup )
  } else {
    return ( whatever )
  }
}