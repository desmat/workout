'use client'

import { useEffect } from "react";
import { BsGithub, BsGoogle } from "react-icons/bs";
import { useCopyToClipboard } from 'usehooks-ts'
import Link from "@/app/_components/Link";
import Page from "@/app/_components/Page";
import useUser from "@/app/_hooks/user";
import useExercises from "@/app/_hooks/exercises";
import useWorkouts from "@/app/_hooks/workouts";
import * as users from "@/services/users";
import { Exercise } from "@/types/Exercise";
import { Workout } from "@/types/Workout";

export default function Component({ params }: { params: { uid?: string } }) {
  // console.log('>> app.profile.page.render()', params.uid);
  const [copiedValue, copy] = useCopyToClipboard();

  const [
    user,
    userLoaded,
    userLoading,
    loadUser,
    signin,
    logout
  ] = useUser((state: any) => [
    state.user,
    state.loaded,
    state.loading,
    state.load,
    state.signin,
    state.logout
  ]);

  const query = user && { createdBy: user.uid }

  const [
    myExercises,
    exercisesLoaded,
    loadExercises,
  ] = useExercises((state: any) => [
    state.find(query),
    state.loaded(query),
    state.load,
  ]);

  const [
    myWorkouts,
    workoutsLoaded,
    loadWorkouts
  ] = useWorkouts((state: any) => [
    state.find(query),
    state.loaded(query),
    state.load
  ]);

  // console.log('>> app.profile.page.render()', { uid: params.uid, user, userLoaded, userLoading });

  useEffect(() => {
    // console.log("** app.profile.page.useEffect", { uid: params.uid, user });
    if (!userLoaded) loadUser();
    if (!exercisesLoaded) loadExercises(query);
    if (!workoutsLoaded) loadWorkouts();
  }, [params.uid]);

  function doSigninWithGoogle(e: any) {
    // console.log("** app.profile.page.doSigninWithGoogle");
    e.preventDefault();
    signin("google");
  }

  function doSigninWithGithub(e: any) {
    // console.log("** app.profile.page.doSigninWithGithub");
    e.preventDefault();
    signin("github");
  }

  function doLogout(e: any) {
    // console.log("** app.profile.page.doLogout");
    e.preventDefault();
    logout();
  }

  const links = [
    user && !user.isAnonymous && <Link key="logout" href="/" style="warning" onClick={doLogout}>Logout</Link>,
    userLoaded && (!user || user.isAnonymous) && <Link key="login" href="/auth?method=login-email">Login</Link>,
    userLoaded && (!user || user.isAnonymous) && <Link key="signuo" href="/auth?method=signup-email">Signup</Link>,
    userLoaded && (!user || user.isAnonymous) &&
    <Link key="google" className="flex flex-row gap-1 items-center" onClick={doSigninWithGoogle}>
      <BsGoogle />Signin
    </Link>,
    userLoaded && (!user || user.isAnonymous) &&
    <Link key="github" className="flex flex-row gap-1 items-center" onClick={doSigninWithGithub}>
      <BsGithub />Signin
    </Link>,
    // TODO CRIPPLE
    // user && user.isAnonymous && <Link key="" href="/" onClick={(e) => doLogout(e, logout)}>Logout</Link>,
  ];

  if (!userLoaded) {
    return (
      <Page
        title="Profile"
        loading={true}
        bottomLinks={links}
      />
    );
  }

  return (
    <Page
      className="flex flex-col items-center"
      title={<>
        {!userLoaded || !user || user?.isAnonymous ? "Profile" : users.getUserName(user)}
        {params.uid &&
          <span>: {params.uid}</span>
        }
      </>}
      subtitle={!userLoaded || !user || user?.isAnonymous ? "Pick a sign-in method below" : undefined}
      links={links}
    >
      {user &&
        <table className="my-1">
          <tbody>
            <tr>
              <td width="50%" className="text-right pr-2 opacity-40 font-semibold">ID</td>
              <td width="50%">
                <Link onClick={() => copy(user.uid)} style="parent secondary" className="flex flex-row">
                  <div title={user.id} className="max-w-[10rem] truncate text-ellipsis">{user.uid}</div>
                  <span className="relative px-0">
                    <Link style="child light" className="absolute left-0.5">{copiedValue == user?.uid ? "Copied" : "Copy"}</Link>
                  </span>
                </Link>
              </td>
            </tr>
            <tr>
              <td className="text-right pr-2 opacity-40 font-semibold">Type</td>
              <td>{user?.isAnonymous && " Anonymous"}{user.admin && " Administrator"}{user && !user.isAnonymous && !user.admin && " User"}</td>
            </tr>
            {user.email &&
              <tr>
                <td className="text-right pr-2 opacity-40 font-semibold">Email</td>
                <td>{user.email}</td>
              </tr>
            }
            {!user.isAnonymous &&
              <tr>
                <td className="text-right pr-2 opacity-40 font-semibold">Provider</td>
                <td>{users.getProviderType(user)}</td>
              </tr>
            }
            {user && myWorkouts.length > 0 &&
              <tr>
                <td className="text-right pr-2 opacity-40 font-semibold">Workouts</td>
                <td>
                  <Link href={`/workouts?uid=${user.uid}`} style="parent secondary" className="flex flex-row">
                    <div>{myWorkouts.length}</div>
                    <span className="relative px-0">
                      <Link style="child light" className="absolute left-2">View</Link>
                    </span>
                  </Link>
                </td>
              </tr>
            }
            {user && myExercises.length > 0 &&
              <tr className={myExercises.length == 0 ? "cursor-pointer hover:underline" : ""}>
                <td className="text-right pr-2 opacity-40 font-semibold">Exercises</td>
                <td>
                  <Link href={`/exercises?uid=${user.uid}`} style="parent secondary" className="flex flex-row">
                    <div>{myExercises.length}</div>
                    <span className="relative px-0">
                      <Link style="child light" className="absolute left-2">View</Link>
                    </span>
                  </Link>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
      {false && !params.uid &&
        <div className="flex flex-col lg:flex-row lg:space-x-4 items-center justify-center mt-4">
          {user && myWorkouts?.length > 0 &&
            <div className="text-dark-2">
              <Link href={`/workouts?uid=${user.uid}`}>Workouts ({myWorkouts.length})</Link>
            </div>
          }
          {user && myExercises?.length > 0 &&
            <div className="text-dark-2">
              <Link href={`/exercises?uid=${user.uid}`}>Exercises ({myExercises.length})</Link>
            </div>
          }
          {user && user.isAnonymous &&
            <div className="text-dark-2">
              <Link href="/auth?method=login-email">Login</Link>
            </div>
          }
          {user && user.isAnonymous &&
            <div className="text-dark-2">
              <Link href="/auth?method=signup-email">Signup</Link>
            </div>
          }
          {user && user.isAnonymous &&
            <div className="text-dark-2">
              <Link href="/" onClick={doSigninWithGoogle}>Signin (Google)</Link>
            </div>
          }
          {user && user.isAnonymous &&
            <div className="text-dark-2">
              <Link href="/" onClick={doSigninWithGithub}>Signin (GitHub)</Link>
            </div>
          }
          {user && !user.isAnonymous &&
            <div className="text-dark-2 hover:text-light-2">
              <Link href="/" onClick={doLogout}>Logout</Link>
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
