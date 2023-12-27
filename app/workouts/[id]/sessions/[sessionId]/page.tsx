'use client'

import { User } from 'firebase/auth';
import moment from 'moment';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import BackLink from '@/app/_components/BackLink';
import Clock from '@/app/_components/Clock';
import Link from "@/app/_components/Link"
import Page from "@/app/_components/Page";
import useWorkouts from "@/app/_hooks/workouts";
import useUser from "@/app/_hooks/user";
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { Exercise } from '@/types/Exercise';
import { byCreatedAtDesc, byName } from '@/utils/sort';

async function handleStartSession(user: User, workout: Workout, fn: any) {
  console.log('>> app.workout[id].session.handleStartSession()', { user, workout });
  fn(user, workout.id);
}

async function handleStopSession(user: User, session: WorkoutSession, fn: any) {
  console.log('>> app.workout[id].session.handleStopSession()', { user, session });
  fn(user, session?.id);
}

async function handleResumeSession(user: User, session: WorkoutSession, fn: any) {
  console.log('>> app.workout[id].session.handleResumeSession()', { user, session });
  fn(user, session?.id);
}

async function handleCompleteSession(user: User, session: WorkoutSession, fn: any) {
  console.log('>> app.workout[id].session.handleCompleteSession()', { user, session });
  fn(user, session?.id);
}

async function handleDeleteSession(user: User, session: WorkoutSession, fn: any, router: any) {
  console.log('>> app.workout[id].session.handleDeleteSession()', { user, session });

  const response = confirm("Delete session?");
  if (response) {
    fn(user, session?.id);
    router.push(`/workouts/${session?.workout?.id}`);
  }
}

async function handleStartSet(user: User, workout: Workout, session: WorkoutSession, exercise: Exercise, offset: number, startSetFn: any, startSessionFn: any) {
  console.log('>> app.workout[id].session.handleStartSet()', { user, workout, session, exercise, offset });

  let _session = session;
  if (!_session) {
    _session = await startSessionFn(user, workout.id);
  }

  startSetFn(user, workout.id, _session.id, exercise, offset);
}

export default function Component({ params }: { params: { id: string, sessionId?: string } }) {
  console.log('>> app.workout[id].session[sessionId].Page.render()', { id: params.id, sessionId: params.sessionId });
  const [
    workouts,
    loaded,
    load,
    deleteWorkout,
    startSession,
    sessions,
    sessionsLoaded,
    loadSessions,
    startSet,
    completeSession,
    stopSession,
    resumeSession,
    deleteSession,
  ] = useWorkouts((state: any) => [
    state.workouts,
    state.loaded,
    state.load,
    state.deleteWorkout,
    state.startSession,
    state.sessions,
    state.sessionsLoaded,
    state.loadSessions,
    state.startSet,
    state.completeSession,
    state.stopSession,
    state.resumeSession,
    state.deleteSession,
  ]);
  const router = useRouter();
  const [user] = useUser((state: any) => [state.user]);
  const session = sessions && sessions.filter((session: WorkoutSession) => session.id == params.sessionId)[0];
  const workout = session && session.workout || workouts && workouts.filter((workout: any) => workout.id == params.id)[0];
  const sessionStarted = ["stopped", "started"].includes(session?.status);
  const sessionPaused = ["stopped"].includes(session?.status);
  const sessionCompleted = session?.status == "completed";
  const sessionTotal = sessionCompleted && session.sets
    .map((set: WorkoutSet) => set.duration || 0)
    .reduce((t: number, v: number) => t + v);
  const currentSet = session && sessionStarted && session.sets && session.sets.sort(byCreatedAtDesc)[0];
  const [previousSet, setPreviousSet] = useState<WorkoutSet | undefined>(undefined);
  const [currentSetDuration, setCurrentSetDuration] = useState(0);
  let [timer, setTimer] = useState(0);

  console.log('>> app.workouts[id].session.Page.render()', { id: params.id, workout, sessions, session, currentSet });
  // console.log('>> app.workouts[id].session.Page.render()', { id: params.id, sessionsLoaded: sessionsLoaded && sessionsLoaded.includes(params.sessionId), status: session?.status });

  useEffect(() => {
    if (!sessionsLoaded || !sessionsLoaded.includes(params.sessionId) || session?.status != "creating") {
      loadSessions(params.id, params.sessionId);
    }
  }, [params.sessionId]);

  useEffect(() => {
    // console.log('>> app.workouts[id].session.Page useEffect(currentSet)', { currentSet, previousSet });
    if (currentSet && (currentSet.id != previousSet?.id || currentSet.status != previousSet?.status)) {
      // console.log('>> app.workouts[id].session.Page useEffect(currentSet) KICKOFF TIMER!', { currentSet, timer });

      if (timer) {
        clearInterval(timer);
        setTimer(0);
      }

      timer = setInterval(() => {
        if (currentSet && currentSet.startedAt) {
          // console.log('>> app.workouts[id].session.Page useEffect(currentSet) TIC TOK!', { currentSet, timer });
          setCurrentSetDuration((currentSet.duration || 0) + moment().valueOf() - currentSet.startedAt);
        }
      }, 500) as any;

      // console.log('>> app.workouts[id].session.Page useEffect(currentSet) timer kicked off', { currentSet, timer });

      setTimer(timer);
      setPreviousSet(currentSet);
      setCurrentSetDuration(currentSet.duration);
    }

    return () => {
      // console.log('>> app.workouts[id].session.Page useEffect(currentSet) KILL TIMER!', { currentSet, timer });
      if (timer) {
        clearInterval(timer);
        setTimer(0);
        setPreviousSet(undefined);
      }
    }
  }, [currentSet?.id, session?.id, session?.status]);

  if (!sessionsLoaded || !sessionsLoaded.includes(params.sessionId)) {
    return (
      <Page
        bottomLinks={[<BackLink key="0" />]}
        loading={true}
      />
    )
  }

  const links = [
    <BackLink key="0" />,
    workout && user && (user.uid == workout.createdBy || user.admin) && <Link key="6" style="warning" onClick={() => handleDeleteSession(user, session, deleteSession, router)}>Delete</Link>,
    // {workout && <Link key="0" onClick={() => setshowDetails(!showDetails)}>{showDetails ? "Hide details" : "Show details"}</Link>},
    workout && user && !session && <Link key="1" onClick={() => handleStartSession(user, workout, startSession)}>Start</Link>,
    workout && user && sessionStarted && !sessionPaused && <Link key="2" onClick={() => handleStopSession(user, session, stopSession)}>Pause</Link>,
    workout && user && session?.status == "stopped" && <Link key="3" onClick={() => handleResumeSession(user, session, resumeSession)}>Resume</Link>,
    workout && user && sessionStarted && <Link key="4" onClick={() => handleCompleteSession(user, session, completeSession)}>Complete</Link>,
    workout && user && sessionStarted && (currentSet.offset < workout.exercises.length - 1) && <Link key="5" onClick={() => handleStartSet(user, workout, session, workout.exercises[currentSet.offset + 1], currentSet.offset + 1, startSet, startSession)}>Next</Link>,
  ];

  if (!session && sessionsLoaded && !sessionsLoaded.includes(params.sessionId)) {
    return (
      <Page
        title="Workout session not found"
        subtitle={params.sessionId}
        links={links}
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

  const statusTitle = session?.status == "stopped" ? "Paused" : undefined;

  return (
    <Page
      title={`${workout?.name}${statusTitle ? ` (${statusTitle})` : ""}`}
      links={links}
    >
      <p className='text-center'>
        <span
          className={`font-bold text-6xl${session?.status != "completed" ? " text-dark-1" : ""} transition-all${["stopped", "started"].includes(session?.status) ? " cursor-pointer" : ""}${["stopped"].includes(session?.status) ? " animate-pulse opacity-50" : ""}`}
          title={
            session?.status == "stopped"
              ? "Resume"
              : session?.status == "started"
                ? "Pause"
                : session?.status == "completed"
                  ? "Workout session completed"
                  : "Pick an exercise to start"
          }
          onClick={() => {
            session?.status == "stopped"
              ? handleResumeSession(user, session, resumeSession)
              : session?.status == "started"
                ? handleStopSession(user, session, stopSession)
                : null;
          }}
        >
          <Clock ms={sessionCompleted && sessionTotal || sessionPaused && currentSet && currentSet.duration || currentSetDuration || 0} />
        </span>
      </p>
      {session && session.status != "completed" && workout && workout.exercises && workout.exercises.length > 0 &&
        <div className="pt-2">
          <div className="self-center flex flex-col gap-2 p-2 _-mr-8 _bg-pink-200">
            {
              workout.exercises
                // .sort(byName)
                .map((exercise: Exercise, i: number) => {
                  return (
                    <Link
                      key={i}
                      style="primary"
                      className="_bg-yellow-200 mx-auto text-2xl"
                      onClick={() => handleStartSet(user, workout, session, exercise, i, startSet, startSession)}
                    >
                      <span
                        className={`_text-dark-1 capitalize ${i == currentSet?.offset && sessionStarted && !sessionPaused ? " text-dark-1 font-bold" : " font-semibold"}`}
                      >
                        {i == currentSet?.offset ? `>> ${exercise.name} <<` : exercise.name}
                      </span>
                    </Link>
                  )
                })
            }
          </div>
        </div>
      }
      {session && session.sets && session.sets.length > 0 &&
        <div className="self-center flex flex-col gap-1 p-4">
          {session && session.status != "completed" &&
            <div className="self-center _font-bold">Previous sets</div>
          }
          {
            session.sets
              .sort(byCreatedAtDesc)
              .map((set: WorkoutSet, i: number) => {
                return (
                  <div className="flex flex-row _bg-pink-300" key={i}>
                    <div className="flex flex-row flex-grow _bg-yellow-100 text-dark-0 capitalize _font-semibold mr-2">
                      {set.exercise?.name}
                    </div>
                    <Clock
                      ms={
                        set.status == "started"
                          ? (set?.duration || 0) + moment().valueOf() - (set?.startedAt || 0)
                          : (set?.duration || 0)
                      }
                    />
                  </div>
                )
              })
          }
        </div>
      }
    </Page>
  )
}
