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
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { ExerciseEntry } from '@/app/_components/Exercise';
import { byCreatedAtDesc, byName } from '@/utils/sort';
import Clock from '@/app/_components/Clock';
import moment from 'moment';

function SessionSummary({ session, workout }: any) {
  // console.log('>> app.workouts[id].SessionSummary.render()', { session });

  const isInProgress = session.status != "completed";
  const isPaused = session.status == "stopped";
  const d = moment(session.createdAt).fromNow();
  const t = session.sets && session.sets
    .map((set: WorkoutSet) => {
      if (isPaused) {
        return (set.duration || 0);
      } else if (isInProgress) {
        return (set.duration || 0) + (moment().valueOf() - (set.startedAt || 0));
      }
      return set.duration || 0;
    })
    .reduce((t: number, v: number) => t + v, 0)

  return (
    <Link href={`/workouts/${workout?.id}/sessions/${session.id}`} style="parent _secondary" className="flex flex-row _bg-pink-300 _-mr-8 relative">
      <div className="flex flex-row _bg-yellow-100 _text-dark-0 _font-semibold mr-2">
        {isInProgress &&
          <>(In progress) </>
        }
        {d}
      </div>
      <div className="flex flex-row _bg-yellow-100">
        <Clock ms={t} />
      </div>
      <span className="relative px-4">
        <Link style="child light" className="absolute right-0 -mr-3">View</Link>
      </span>
    </Link>
  )
}

function WorkoutDetails({ id, prompt, exercises, sessions, showDetails, user }: any) {
  console.log('>> app.workouts[id].WorkoutDetails.render()', { id, exercises, sessions });

  return (
    <p className="flex flex-col items-center gap-4">
      {exercises && exercises.length > 0 &&
        <div className="flex flex-col items-center gap-1">
          <div className="text-dark-0 opacity-40">Exercises</div>
          <div className="flex flex-col gap-1">
            {
              exercises
                // .sort(byName)
                .map((exercise: Exercise, offset: number) => (
                  <div key={offset}>
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
        </div>
      }
      {sessions && sessions.length > 0 &&
        <div className="flex flex-col items-center gap-1">
          <div className="text-dark-0 opacity-40">Sessions</div>
          <div className="flex flex-col items-end gap-0">
            {sessions
              .sort(byCreatedAtDesc)
              .map((session: WorkoutSession, i: number) => {
                return (
                  <div key={i} className="flex">
                    <SessionSummary workout={{ id }} session={session} />
                  </div>
                )
              })
            }
          </div>
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

async function handleRegenerate(user: User, workout: Workout, regenerateFn: any, router: any) {
  console.log('>> app.workout[id].Page.handleRegenerate()', { user, workout });

  // TODO
}

async function handleStartSession(user: User, workout: Workout, startFn: any, router: any) {
  console.log('>> app.workout[id].Page.handleStartSession()', { user, workout });

  const session = await startFn(user, workout.id);
  if (session) {
    router.push(`/workouts/${workout.id}/sessions/${session.id}`);
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
  const workoutSessions = workout && sessions && sessions.filter((session: WorkoutSession) => session?.workout?.id == workout.id);
  const filteredSessions = workout && sessions && sessions.filter((session: WorkoutSession) => session?.workout?.id == workout.id && session.status != "completed");
  const session = filteredSessions && filteredSessions.length > 0 && filteredSessions[filteredSessions.length - 1];

  console.log('>> app.workouts[id].page.render()', { id: params.id, workout });

  useEffect(() => {
    load({ id: params.id });
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
    workout && user && (user.uid == workout.createdBy || user.admin) && <Link key="3" style="warning" onClick={() => handleDeleteWorkout(params.id, deleteWorkout, router)}>Delete</Link>,
    // workout && <Link onClick={() => setshowDetails(!showDetails)}>{showDetails ? "Hide details" : "Show details"}</Link>},
    // workout && user && workout.prompt && <Link key="1" onClick={() => handleRegenerate(user, workout, startSession, router)}>Regenerate</Link>,
    workout && user && !session && <Link key="1" onClick={() => handleStartSession(user, workout, startSession, router)}>Start</Link>,
    workout && user && session && <Link key="2" href={`/workouts/${workout.id}/sessions/${session.id}`}>Resume</Link>,
  ];

  if (!workout) {
    return (
      <Page
        title="Workout not found"
        subtitle={params.id}
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
          <WorkoutDetails {...{ ...workout, sessions: workoutSessions, showDetails, user }} />
        </div>
      }
    </Page>
  )
}
