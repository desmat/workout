'use client'

import moment from 'moment';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import Link from "@/app/_components/Link"
import useWorkouts from "@/app/_hooks/workouts";
import useUser from "@/app/_hooks/user";
import Loading from "./loading";
import { Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { Exercise } from '@/types/Exercise';
import { byCreatedAtDesc, byName } from '@/utils/sort';

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
    <p className="text-left flex flex-col gap-2 pb-6" >
      {/* <Link style="parent" onClick={() => !showDetails && setshowDetail(!showDetail)}> */}
      <Link style="parent" href={`/exercises/${id}`}>
        <div className="">
          <span className="capitalize font-semibold">{name}</span>{description ? `: ${description}` : ""}
          {/* {details && !showDetails &&
            <>
              <Link style="child light" className="ml-2">{showDetail ? "Hide details" : "Show details"}</Link>
            </>
          } */}
          <Link style="child light" className="ml-2">View</Link>
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
    <p className="text-left pb-2">
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

async function handleStartSession(user: User, workout: Workout, fn: any) {
  console.log('>> app.workout[id].session.handleStartSession()', { user, workout });

  const session = fn(user, workout.id);
  // if (session) {
  //   router.push(`/workouts/${workout.id}/session`);
  // }
}

async function handleStopSession(user: User, session: WorkoutSession, fn: any) {
  console.log('>> app.workout[id].session.handleStopSession()', { user, session });

  const updatedSession = fn(user, session?.id);
  // if (session) {
  //   router.push(`/workouts/${workout.id}/session`);
  // }
}

async function handleResumeSession(user: User, session: WorkoutSession, fn: any) {
  console.log('>> app.workout[id].session.handleResumeSession()', { user, session });

  const updatedSession = fn(user, session?.id);
  // if (session) {
  //   router.push(`/workouts/${workout.id}/session`);
  // }
}

async function handleCompleteSession(user: User, session: WorkoutSession, fn: any) {
  console.log('>> app.workout[id].session.handleCompleteSession()', { user, session });

  const updatedSession = fn(user, session?.id);
  // if (session) {
  //   router.push(`/workouts/${workout.id}/session`);
  // }
}

async function handleStartSet(user: User, workout: Workout, session: WorkoutSession, exercise: Exercise, startSetFn: any, startSessionFn: any) {
  console.log('>> app.workout[id].session.handleStartSet()', { user, workout, session, exercise });

  let _session = session;
  if (!_session) {
    _session = await startSessionFn(user, workout.id);
  }

  const set = startSetFn(user, workout.id, _session.id, exercise);
  console.log('>> app.workout[id].session.handleStartSet()', { set });
  // if (session) {
  //   router.push(`/workouts/${workout.id}/session`);
  // }
}

const Timer = ({ ms }: { ms: number }) => {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 1000 / 60) % 60;
  const h = Math.floor(ms / 60 / 60 / 1000);

  return (
    <span className="font-mono">{`${(h + "").padStart(2, '0')}:${(m + "").padStart(2, '0')}:${(s + "").padStart(2, '0')}`}</span>
  )
}

export default function Page({ params }: { params: { id: string } }) {
  // console.log('>> app.workout[id].Page.render()', { id: params.id });
  const router = useRouter();
  const [
    workouts,
    loaded,
    load,
    deleteWorkout,
    startSession,
    sessions,
    startSet,
    completeSession,
    completeSet,
    stopSession,
    resumeSession,
  ] = useWorkouts((state: any) => [
    state.workouts,
    state.loaded,
    state.load,
    state.deleteWorkout,
    state.startSession,
    state.sessions,
    state.startSet,
    state.completeSession,
    state.completeSet,
    state.stopSession,
    state.resumeSession,
  ]);
  const [user] = useUser((state: any) => [state.user]);
  const workout = workouts && workouts.filter((workout: any) => workout.id == params.id)[0];
  const filteredSessions = sessions && workout && sessions.filter((session: WorkoutSession) => session.workout.id == workout.id);
  const session = filteredSessions && filteredSessions[filteredSessions.length - 1];
  const sessionStarted = session?.status == "started";
  const currentSet = session && sessionStarted && session.sets && session.sets.sort(byCreatedAtDesc)[0];
  const [previousSet, setPreviousSet] = useState<WorkoutSet | undefined>(undefined);
  const [currentSetDuration, setCurrentSetDuration] = useState(0);
  let [timer, setTimer] = useState(0);

  const updateCurrentSetDurection = () => {
    if (currentSet && currentSet.startedAt) {
      // console.log('>> app.workouts[id].session.Page useEffect(currentSet) TIC TOK!', { currentSet, timer });
      setCurrentSetDuration((currentSet.duration || 0) + moment().valueOf() - currentSet.startedAt);
    }
  }
  // console.log('>> app.workouts[id].session.Page.render()', { id: params.id, workout, sessions, session });

  useEffect(() => {
    load(params.id);
  }, [params.id]);

  useEffect(() => {
    setCurrentSetDuration(0);

    return () => {
      setCurrentSetDuration(0);
    }
  }, [session]);

  useEffect(() => {
    console.log('>> app.workouts[id].session.Page useEffect(currentSet)', { currentSet, previousSet });
    if (currentSet && (currentSet.id != previousSet?.id || currentSet.status != previousSet?.status)) {
      console.log('>> app.workouts[id].session.Page useEffect(currentSet) KICKOFF TIMER!', { currentSet, timer });

      if (timer) {
        clearInterval(timer);
        setTimer(0);
      }

      timer = setInterval(() => updateCurrentSetDurection(), 500) as any;

      console.log('>> app.workouts[id].session.Page useEffect(currentSet) timer kicked off', { currentSet, timer });

      setTimer(timer);
      setPreviousSet(currentSet);
      setCurrentSetDuration(0);
    }

    return () => {
      console.log('>> app.workouts[id].session.Page useEffect(currentSet) KILL TIMER!', { currentSet, timer });
      if (timer) {
        clearInterval(timer);
        setTimer(0);
        setPreviousSet(undefined);
      }
    }
  }, [currentSet?.id, session?.id]);

  if (!loaded) {
    return <Loading />
  }

  const links = (
    <div className="flex flex-row gap-3 items-center justify-center mt-2 mb-4">
      <Link href={`/workouts/${params.id}`}>Back</Link>
      {/* {workout && <Link onClick={() => setshowDetails(!showDetails)}>{showDetails ? "Hide details" : "Show details"}</Link>} */}
      {workout && user && !session && <Link onClick={() => handleStartSession(user, workout, startSession)}>Start</Link>}
      {workout && user && ["stopped", "started"].includes(session?.status) && <Link onClick={() => handleCompleteSession(user, session, completeSession)}>Complete</Link>}
      {workout && user && sessionStarted && <Link onClick={() => handleStopSession(user, session, stopSession)}>Pause</Link>}
      {workout && user && session?.status == "stopped" && <Link onClick={() => handleResumeSession(user, session, resumeSession)}>Resume</Link>}
      {/* {workout && user && (user.uid == workout.createdBy || user.admin) && <Link style="warning" onClick={() => handleDeleteWorkout(params.id, deleteWorkout, router)}>Delete</Link>} */}
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

  // if (!session) {
  //   return (
  //     <main className="flex flex-col">
  //       <h1 className="text-center">{workout.name} Session (Not Started)</h1>
  //       {links}
  //     </main>
  //   )
  // }

  return (
    <main className="flex flex-col items-left lg:max-w-4xl lg:mx-auto px-4">
      <h1 className="text-center capitalize">{workout.name} Session ({session?.status || "Not created"})</h1>
      {links}
      <p className='text-center'>
        <span
          className={`font-bold text-4xl text-dark-1 transition-all${["stopped", "started"].includes(session?.status) ? " cursor-pointer" : ""}${session?.status == "stopped" ? " animate-pulse" : ""}`}
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
          <Timer ms={currentSetDuration} />
        </span>
      </p>
      {workout && workout.exercises && workout.exercises.length > 0 &&
        <>
          <div className={`self-center _font-semibold pt-4 transition-all${!session || session.status == "created" ? " animate-pulse" : ""}`}>{
            ["stopped", "started"].includes(session?.status)
              ? "Next set:"
              : session?.status == "completed"
                ? "Resume with:"
                : "Start with:"
          }
          </div>
          <div className="self-center flex flex-col gap-2 p-2 _-mr-8 _bg-pink-200">
            {
              workout.exercises
                .sort(byName)
                .map((exercise: Exercise, i: number) => {
                  return (
                    <Link key={i} style="parent" className="_bg-yellow-200" onClick={() => handleStartSet(user, workout, session, exercise, startSet, startSession)}>
                      <span className={`text-dark-0 capitalize ${exercise.id == currentSet?.exercise?.id ? " text-dark-1 font-bold" : " text-dark-0 font-semibold"}`}>{exercise.name}</span>
                      <Link style="child light" className="ml-2 absolute">{sessionStarted ? "Next" : "Start"}</Link>
                    </Link>
                  )
                })
            }
          </div>
        </>
      }
      {session && session.sets && session.sets.length > 0 &&
        <div className="self-center flex flex-col gap-1 p-4">
          <div className="self-center _font-bold">Previous sets:</div>
          {
            session.sets
              .sort(byCreatedAtDesc)
              .map((set: WorkoutSet, i: number) => {
                return (
                  <div className="_px-0.5" key={i}>
                    <span className="text-dark-0 capitalize _font-semibold mr-2">{set.exercise?.name} </span>
                    (<Timer
                      ms={
                        set.status == "started"
                          ? (set?.duration || 0) + moment().valueOf() - (set?.startedAt || 0)
                          : (set?.duration || 0)
                      }
                    />)
                  </div>
                )
              })
          }
        </div>
      }
      {
        // session &&
        //   <div className="md:self-center flex flex-col gap-3 p-6">
        //     <div className="md:self-center font-bold">Session details</div>
        //     {
        //       Object.entries(session)
        //         .filter(([k, v]) => !["workout", "_sets"].includes(k))
        //         .map(([k, v]: any) => {
        //           // if (k == "sets") {
        //           //   return (
        //           //     <div className="_px-0.5">
        //           //       <span className="text-dark-0 font-semibold">Sets:</span> {v.map((set: WorkoutSet) => `${set.exercise.id} (${set.status})`).join(", ")}
        //           //       {/* <span className="text-dark-0 font-semibold">Sets:</span> {v.length} */}
        //           //     </div>
        //           //   )
        //           // }
        //           return (
        //             <div className="_px-0.5">
        //               <span className="text-dark-0 font-semibold">{k}:</span> {JSON.stringify(v)}
        //             </div>
        //           )
        //         })
        //     }
        //   </div>
      }
      {/* {currentSet &&
        <div className="md:self-center flex flex-col gap-3 p-6">
          <div className="md:self-center font-bold">Current Set</div>
          {
            Object.entries(currentSet)
              .filter(([k, v]) => !["workout", "sets"].includes(k))
              .map(([k, v]: any) => {
                return (
                  <div className="_px-0.5">
                    <span className="text-dark-0 font-semibold">{k}:</span> {JSON.stringify(v)}
                  </div>
                )
              })
          }
        </div>
      } */}

      {links}
    </main>
  )
}
