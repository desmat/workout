'use client'

import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import BackLink from '@/app/_components/BackLink';
import Link from "@/app/_components/Link"
import useWorkouts from "@/app/_hooks/workouts";
import useUser from "@/app/_hooks/user";
import Loading from "./loading";
import { Workout, WorkoutSession } from '@/types/Workout';

function ExerciseEntry({ id, name, /* description,*/ showDetails }: any) {
  const [showDetail, setshowDetail] = useState(false);
  // const maxShortIngredients = 5;
  // const shortIngredients = ingredients?.length > 0 ?
  //   ingredients.length > maxShortIngredients
  //     ? ingredients.map(stripIngredientQuantity).slice(0, maxShortIngredients).join(", ")
  //     : ingredients.map(stripIngredientQuantity).join(", ")
  //   : "";
  const summary = undefined; // "(TODO: summary)";
  const details = undefined; // "(TODO: details)";
  const description = undefined; // "(TODO: description)";

  console.log('>> app.workouts[id].ExerciseEntry.render()', { name, description });

  useEffect(() => {
    if (showDetails) {
      setshowDetail(false);
    }
  }, [showDetails]);

  return (
    <p className="text-center flex flex-col gap-2 pb-2 mx-auto" >
      {/* <Link style="parent" onClick={() => !showDetails && setshowDetail(!showDetail)}> */}
      <Link style="parent" className=" _bg-yellow-200" href={`/exercises/${id}`}>
        <div className="">
          <span className="capitalize font-semibold">{name}</span>{description ? `: ${description}` : ""}
          {/* {details && !showDetails &&
            <>
              <Link style="child light" className="ml-2">{showDetail ? "Hide details" : "Show details"}</Link>
            </>
          } */}
          <Link style="child light" className="ml-2 absolute">View</Link>
        </div>
        {summary && !showDetail && !showDetails &&
          <div className="capitalize italic text-dark-3 -mt-1">{summary}</div>
        }
        {/* {ingredients.length > maxShortIngredients &&
        <span className="italic">
          {` (and ${ingredients.length - maxShortIngredients} more)`}
        </span>
      } */}
        {details && (showDetails || showDetail) &&
          <div className="mb-2">
            <div className="font-semibold">Details:</div>
            <div>{details}</div>
          </div>
        }
      </Link>
    </p>
  );
}

function WorkoutDetails({ id, prompt, exercises, showDetails }: any) {
  console.log('>> app.workouts[id].WorkoutDetails.render()', { id, exercises });

  return (
    <p className="text-left pb-4">
      {exercises && exercises.length > 0 &&
        <div>
          {
            exercises
              // .sort((a: Post, b: Post) => b.postedAt.valueOf() - a.postedAt.valueOf())
              .map((exercise: any, offset: number) => <div className="ml-2 flex" key={offset}><ExerciseEntry {...{ ...exercise, offset, showDetails }} /></div>)
          }
        </div>
      }
    </p>
  );
}

async function handleDeleteWorkout(id: string, deleteFn: any, router: any) {
  const response = confirm("Delete workout?");
  if (response) {
    deleteFn(id);
    router.back();
  }
}

async function handleStartSession(user: User, workout: Workout, startFn: any, router: any) {
  console.log('>> app.workout[id].Page.render()', { user, workout });

  const session = startFn(user, workout.id);
  if (session) {
    router.push(`/workouts/${workout.id}/session`);
  }
}



export default function Page({ params }: { params: { id: string } }) {
  // console.log('>> app.workout[id].Page.render()', { id: params.id });
  const router = useRouter();
  const [showDetails, setshowDetails] = useState(false);
  const [workouts, loaded, load, deleteWorkout, startSession, sessions, sessionsLoaded, loadSessions] = useWorkouts((state: any) => [state.workouts, state.loaded, state.load, state.deleteWorkout, state.startSession, state.sessions, state.sessionsLoaded, state.loadSessions]);
  const [user] = useUser((state: any) => [state.user]);
  const workout = workouts.filter((workout: any) => workout.id == params.id)[0];
  const filteredSessions = workout && sessions && sessions.filter((session: WorkoutSession) => session?.workout?.id == workout.id && session.status != "completed");
  const session = filteredSessions && filteredSessions.length > 0 && filteredSessions[filteredSessions.length - 1];

  console.log('>> app.workouts[id].page.render()', { id: params.id, workout });

  useEffect(() => {
    load(params.id);
  }, [params.id]);

  useEffect(() => {
    if (workout?.id) loadSessions(workout.id);
  }, [workout?.id]);

  if (!loaded) {
    return <Loading />
  }

  const links = (
    <div className="flex flex-row gap-3 items-center justify-center mt-2 mb-4">
      <BackLink />
      {/* {workout && <Link onClick={() => setshowDetails(!showDetails)}>{showDetails ? "Hide details" : "Show details"}</Link>} */}
      {workout && user && !session && <Link onClick={() => handleStartSession(user, workout, startSession, router)}>Start</Link>}
      {workout && user && session && <Link href={`/workouts/${workout.id}/session`}>Resume</Link>}
      {workout && user && (user.uid == workout.createdBy || user.admin) && <Link style="warning" onClick={() => handleDeleteWorkout(params.id, deleteWorkout, router)}>Delete</Link>}
    </div>
  );

  if (!workout) {
    return (
      <main className="flex flex-col">
        <h1 className="text-center">Workout {params.id} not found</h1>
        {links}
      </main>
    )
  }

  return (
    <main className="flex flex-col items-left lg:max-w-4xl lg:mx-auto px-4">
      <h1 className="text-center capitalize">{workout.name}</h1>
      <p className='italic text-center'>
        Press Start to begin a workout
      </p>
      {links}
      {workout && workout.exercises && (workout.exercises.length as number) > 0 &&
        <div className="self-center">
          <WorkoutDetails {...{ ...workout, showDetails }} />
        </div>
      }
      {workout && workout?.exercises.length > 4 && links}
    </main>
  )
}
