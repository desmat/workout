'use client'

import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import BackLink from '@/app/_components/BackLink';
import Page from "@/app/_components/Page";
import Link from "@/app/_components/Link"
import useExercises from '@/app/_hooks/exercises';
import useWorkouts from "@/app/_hooks/workouts";
import useUser from "@/app/_hooks/user";
import { Exercise } from '@/types/Exercise';
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
              // .sort(byName)
              .map((exercise: Exercise, offset: number) => (
                <div className="ml-2 flex" key={offset}>
                  <ExerciseEntry
                    exercise={{
                      id: exercise.id,
                      name: exercise.name,
                      status: exercise.status,
                      directions: exercise.directions,
                    }}
                    user={user}
                  />
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

  const session = await startFn(user, workout.id);
  if (session) {
    router.push(`/workouts/${workout.id}/session`);
  }
}

export default function Component({ params }: { params: { id: string } }) {
  // console.log('>> app.workout[id].Page.render()', { id: params.id });
  const router = useRouter();
  const [showDetails, setshowDetails] = useState(false);
  const [workouts, loaded, load, deleteWorkout, startSession, sessions, sessionsLoaded, loadSessions] = useWorkouts((state: any) => [state.workouts, state.loaded, state.load, state.deleteWorkout, state.startSession, state.sessions, state.sessionsLoaded, state.loadSessions]);
  const [exercisesLoaded, loadExercises] = useExercises((state: any) => [state.loaded, state.load]);
  const [user] = useUser((state: any) => [state.user]);
  const workout = workouts.filter((workout: any) => workout.id == params.id)[0];
  const filteredSessions = workout && sessions && sessions.filter((session: WorkoutSession) => session?.workout?.id == workout.id && session.status != "completed");
  const session = filteredSessions && filteredSessions.length > 0 && filteredSessions[filteredSessions.length - 1];

  console.log('>> app.workouts[id].page.render()', { id: params.id, workout });

  useEffect(() => {
    load(params.id);
    loadExercises(); // prefetch
  }, [params.id]);

  useEffect(() => {
    if (workout?.id) loadSessions(workout.id);
  }, [workout?.id]);

  if (!loaded) {
    return (
      <Page
        bottomLinks={[<BackLink key="0" />]}
        loading={true}
      />
    )
  }

  const links = [
    <BackLink key="0" />,
    // workout && <Link onClick={() => setshowDetails(!showDetails)}>{showDetails ? "Hide details" : "Show details"}</Link>},
    workout && user && !session && <Link key="1" onClick={() => handleStartSession(user, workout, startSession, router)}>Start</Link>,
    workout && user && session && <Link key="2" href={`/workouts/${workout.id}/session`}>Resume</Link>,
    workout && user && (user.uid == workout.createdBy || user.admin) && <Link key="3" style="warning" onClick={() => handleDeleteWorkout(params.id, deleteWorkout, router)}>Delete</Link>,
  ];

  if (!workout) {
    return (
      <Page
        title={<>Workout {params.id} not found</>}
        links={links}
      />
    )
  }

  return (
    <Page
      title={workout.name}
      subtitle="Press Start to begin a workout session"
      links={links}
    >
      {workout && workout.exercises && (workout.exercises.length as number) > 0 &&
        <div className="self-center">
          <WorkoutDetails {...{ ...workout, showDetails, user }} />
        </div>
      }
    </Page>
  )
}
