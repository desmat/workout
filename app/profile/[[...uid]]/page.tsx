'use client'

import Link from "next/link";
import { useEffect } from "react";
import useUser from "@/app/_hooks/user";
import useWorkouts from "@/app/_hooks/workouts";
import Page from "@/app/_components/Page"
import * as users from "@/services/users";
import { Workout } from "@/types/Workout";

function doSigninWithGoogle(e: any, signinFn: any) {
  console.log("** app.profile.page.doSigninWithGoogle");
  e.preventDefault();
  signinFn("google");
}

function doSigningAnonymously(e: any, signinFn: any) {
  console.log("** app.profile.page.doSigningAnonymously");
  e.preventDefault();
  signinFn("anonymous");
}

function doLogout(e: any, logoutFn: any) {
  console.log("** app.profile.page.doLogout");
  e.preventDefault();
  logoutFn();
}

export default function Component({ params }: { params: { uid?: string } }) {
  // console.log('>> app.profile.page.render()', params.uid);
  const [user, userLoaded, loadUser, signin, logout] = useUser((state: any) => [state.user, state.loaded, state.load, state.signin, state.logout]);
  const [workouts, workoutsLoaded, loadWorkouts] = useWorkouts((state: any) => [state.workouts, state.loaded, state.load]);
  const myWorkouts = workoutsLoaded && workouts.filter((workout: Workout) => workout.createdBy == user?.uid);
  console.log('>> app.profile.page.render()', { uid: params.uid, user, userLoaded });

  useEffect(() => {
    // console.log("** app.profile.page.useEffect", { uid: params.uid, user });
    if (!userLoaded) loadUser();
    if (!workoutsLoaded) loadWorkouts();
  }, [params.uid]);

  if (!userLoaded) {
    return (
      <Page
        title="Profile"
        subtitle="Loading..."
      />
    );
  }

  if (params.uid || !params.uid && !user) { // TODO UNCRIPPLE
    return (
      <Page
        className="flex flex-col items-center"
        title="Profile"
      >
        <div className="flex flex-col lg:flex-row lg:space-x-4 items-center justify-center mt-4">
          <div className="text-dark-2">
            <Link href="/" onClick={(e) => doSigningAnonymously(e, signin)}>Signin Anonymously</Link>
          </div>
          <div className="text-dark-2">
            <Link href="/auth?method=login-email">Login with Email</Link>
          </div>
          <div className="text-dark-2">
            <Link href="/auth?method=signup-email">Signup with Email</Link>
          </div>
          <div className="text-dark-2">
            <Link href="/" onClick={(e) => doSigninWithGoogle(e, signin)}>Signin with Google</Link>
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page
      className="flex flex-col items-center"
      title={<>
        Profile
        {params.uid &&
          <span>: {params.uid}</span>
        }
      </>}
    >
      {user &&
        <>
          <h2>{users.getUserName(user)}{user.isAnonymous ? "" : ` (${users.getProviderName(user)})`}</h2>

          <div className="p-0.5">
            <span className="text-dark-0 font-semibold">User ID:</span> {user.uid}{user?.isAnonymous && " (Anonymous)"}{user.admin && " (Administrator)"}
          </div>
          {user.email &&
            <div className="p-0.5">
              <span className="text-dark-0 font-semibold">Email:</span> {user.email}
            </div>
          }
          {!user.isAnonymous &&
            <div className="p-0.5">
              <span className="text-dark-0 font-semibold">Provider:</span> {users.getProviderType(user)}
            </div>
          }

          {/* <p>isAnonymous: {user?.isAnonymous ? "true" : "false"}</p> */}
          {/* <p>isAdmin: {user?.admin ? "true" : "false"}</p> */}
          {/* <p>provider: {user?.providerId}{user?.providerData[0]?.providerId ? ` (${user?.providerData[0]?.providerId})` : ''}</p>
          <p>providerId: {user?.providerId}</p>
          <p>providerData: {JSON.stringify(user?.providerData)}</p> */}
          {/* <p>provider: {users.getProviderName(user)}</p> */}
          {/* <p>email: {user?.email}</p> */}
          {/* <p>displayName: {user?.displayName}</p> */}
          {/* <p>username: {users.getUserName(user)}</p> */}
          {/* <p className="flex whitespace-nowrap">photoURL: <img className="max-w-10 max-h-10" src={user.photoURL as string | undefined}></img></p> */}
        </>
      }
      {!params.uid &&
        <div className="flex flex-col lg:flex-row lg:space-x-4 items-center justify-center mt-4">
          {user && myWorkouts.length > 0 &&
            <div className="text-dark-2">
              <Link href={`/workouts?uid=${user.uid}`}>Workouts ({myWorkouts.length})</Link>
            </div>
          }
          {user && user.isAnonymous &&
            <div className="text-dark-2">
              <Link href="/auth?method=login-email">Login with Email</Link>
            </div>
          }
          {user && user.isAnonymous &&
            <div className="text-dark-2">
              <Link href="/auth?method=signup-email">Signup with Email</Link>
            </div>
          }
          {user && user.isAnonymous &&
            <div className="text-dark-2">
              <Link href="/" onClick={(e) => doSigninWithGoogle(e, signin)}>Signin with Google</Link>
            </div>
          }
          {user && !user.isAnonymous &&
            <div className="text-dark-2 hover:text-light-2">
              <Link href="/" onClick={(e) => doLogout(e, logout)}>Logout</Link>
            </div>
          }
          {/* {user && user.isAnonymous && // TODO CRIPPLE
            <div className="text-dark-2 hover:text-light-2">
              <Link href="/" onClick={(e) => doLogout(e, logout)}>Logout</Link>
            </div>
          } */}
        </div>
      }
    </Page>
  )
}
