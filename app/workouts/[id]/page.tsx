'use client'

import moment from 'moment';
import { useRouter } from 'next/navigation'
import { useEffect } from "react";
import Page from "@/app/_components/Page";
import Link from "@/app/_components/Link"
import useExercises from '@/app/_hooks/exercises';
import useWorkouts from "@/app/_hooks/workouts";
import useUser from "@/app/_hooks/user";
import { Exercise } from '@/types/Exercise';
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { ExerciseEntry } from '@/app/_components/Exercise';
import Clock from '@/app/_components/Clock';
import { byCreatedAtDesc, byName } from '@/utils/sort';
import { capitalize } from '@/utils/format';

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
      <span className="relative px-2">
        <Link style="child light" className="absolute left-1.5">View</Link>
      </span>
    </Link>
  )
}

function Exercises({ id, prompt, exercises, sessions, showDetails, user }: any) {
  // console.log('>> app.workouts[id].WorkoutDetails.render()', { id, exercises, sessions });

  return (
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
  );
}

function Sessions({ id, prompt, exercises, sessions, showDetails, user }: any) {
  // console.log('>> app.workouts[id].WorkoutDetails.render()', { id, exercises, sessions });

  return (
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
  );
}

export default function Component({ params }: { params: { id: string } }) {
  // console.log('>> app.workout[id].Page.render()', { id: params.id });
  const router = useRouter();
  const [workouts, loaded, load, deleteWorkout, startSession, sessions, sessionsLoaded, loadSessions] = useWorkouts((state: any) => [state.workouts, state.loaded, state.load, state.deleteWorkout, state.startSession, state.sessions, state.sessionsLoaded, state.loadSessions]);
  const [user] = useUser((state: any) => [state.user]);
  const query = user && { createdBy: user.uid };
  const [
    exercisesLoaded, 
    loadExercises
  ] = useExercises((state: any) => [
    state.loaded(query) || state.loaded(),
    state.load(),
  ]);
  const workout = workouts.filter((workout: any) => workout.id == params.id)[0];
  const isReady = ["created", "saved"].includes(workout?.status);
  const workoutSessions = workout && sessions && sessions.filter((session: WorkoutSession) => session?.workout?.id == workout.id);
  const filteredSessions = workout && sessions && sessions.filter((session: WorkoutSession) => session?.workout?.id == workout.id && session.status != "completed");
  const session = filteredSessions && filteredSessions.length > 0 && filteredSessions[filteredSessions.length - 1];
  // console.log('>> app.workouts[id].page.render()', { id: params.id, workout });

  useEffect(() => {
    load({ id: params.id });
    loadExercises(); // prefetch
  }, [params.id]);

  useEffect(() => {
    workout?.id && loadSessions(workout.id);
  }, [workout?.id]);

  async function handleDeleteWorkout() {
    // console.log('>> app.workout[id].Page.handleDeleteWorkout()', { user, workout });
    const response = confirm("Delete workout?");
    if (response) {
      deleteWorkout(workout.id);
      router.back();
    }
  }

  async function handleRegenerate() {
    // console.log('>> app.workout[id].Page.handleRegenerate()', { user, workout });

    // TODO
  }

  async function handleStartSession() {
    // console.log('>> app.workout[id].Page.handleStartSession()', { user, workout });
    const session = await startSession(user, workout.id);
    if (session) {
      router.push(`/workouts/${workout.id}/sessions/${session.id}`);
    }
  }

  const links = [
    <Link key="back" href="/workouts">Back</Link>,
    workout && isReady && user && (user.uid == workout.createdBy || user.admin) && <Link key="delete" style="warning" onClick={handleDeleteWorkout}>Delete</Link>,
    // workout isReady && && user && workout.prompt && <Link key="regen" onClick={() => handleRegenerate()}>Regenerate</Link>,
    workout && isReady && user && (user.uid == workout.createdBy || user.admin) && <Link key="edit" href={`/workouts/${workout.id}/edit`}>Edit</Link>,
    workout && isReady && user && !session && <Link key="start" onClick={handleStartSession}>Start</Link>,
    workout && isReady && user && session && <Link key="resume" href={`/workouts/${workout.id}/sessions/${session.id}`}>Resume</Link>,
  ];

  if (!isReady) {
    return (
      <Page
        bottomLinks={links}
        loading={true}
      />
    )
  }

  if (!workout) {
    return (
      <Page
        title="Workout not found"
        subtitle={params.id}
        links={links}
      />
    )
  }

  if (!isReady) {
    return (
      <Page
        title={workout.name || "(Unnamed Workout)"}
        subtitle={`(${capitalize(workout.status)}...)`}
        links={links}
        loading={true}
      />
    )
  }

  return (
    <Page
      title={workout.name}
      subtitle="Press Start to begin a workout session"
      links={links}
    >
      {workout &&
        <div className="flex flex-col items-center gap-4">
          {/* <WorkoutDetails {...{ ...workout, sessions: workoutSessions, showDetails, user }} /> */}
          {workout && workout.exercises && workout.exercises.length > 0 &&
            <Exercises {...{ ...workout, sessions: workoutSessions, user }} />
          }
          {sessions && sessions.length > 0 &&
            <Sessions {...{ ...workout, sessions: workoutSessions, user }} />
          }
        </div>
      }
    </Page>
  )
}
