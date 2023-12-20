'use client'

import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import BackLink from '@/app/_components/BackLink';
import { Page, PageLinks } from "@/app/_components/Page";
import Link from "@/app/_components/Link"
import useWorkouts from "@/app/_hooks/workouts";
import useUser from "@/app/_hooks/user";
import Loading from "./loading";
import { Workout, WorkoutSession } from '@/types/Workout';
import { ExerciseEntry } from '@/app/_components/Exercise';
import { byName } from '@/utils/sort';

function WorkoutDetails({ id, prompt, exercises, showDetails, user }: any) {
  console.log('>> app.workouts[id].WorkoutDetails.render()', { id, exercises });

  return (
    <p className="text-left pb-4">
      {exercises && exercises.length > 0 &&
        <div className="flex flex-col gap-3">
          {
            exercises
              .sort(byName)
              .map((exercise: any, offset: number) => (
                <div className="ml-2 flex" key={offset}>
                  <ExerciseEntry exercise={exercise} user={user} />
                </div>
              ))
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

export default function Component({ params }: { params: { id: string } }) {
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
    <PageLinks>
      <BackLink />
      {/* {workout && <Link onClick={() => setshowDetails(!showDetails)}>{showDetails ? "Hide details" : "Show details"}</Link>} */}
      {workout && user && !session && <Link onClick={() => handleStartSession(user, workout, startSession, router)}>Start</Link>}
      {workout && user && session && <Link href={`/workouts/${workout.id}/session`}>Resume</Link>}
      {workout && user && (user.uid == workout.createdBy || user.admin) && <Link style="warning" onClick={() => handleDeleteWorkout(params.id, deleteWorkout, router)}>Delete</Link>}
    </PageLinks>
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
    <Page>
      <h1 className="text-center capitalize">{workout.name}</h1>
      <p className='italic text-center'>
        Press Start to begin a workout
      </p>
      <div className="my-4">
        {links}
      </div>
      {workout && workout.exercises && (workout.exercises.length as number) > 0 &&
        <div className="self-center">
          <WorkoutDetails {...{ ...workout, showDetails, user }} />
        </div>
      }
      {workout && workout?.exercises.length > 4 && links}
      <div className="flex flex-grow items-end justify-center h-full mt-2">
        {links}
      </div>
    </Page>
  )
}
