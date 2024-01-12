'use client'

import { User } from 'firebase/auth';
import moment from 'moment';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import { FaRepeat, FaShuffle } from "react-icons/fa6";
import { IoPause, IoPlay, IoPlayBack, IoPlayForward } from "react-icons/io5";
import { TbClockPlay, TbClock } from "react-icons/tb";
import Clock from '@/app/_components/Clock';
import Link from "@/app/_components/Link"
import Page from "@/app/_components/Page";
import useWorkouts from "@/app/_hooks/workouts";
import useWorkoutSessions from "@/app/_hooks/workoutSessions";
import useUser from "@/app/_hooks/user";
import { SessionMode, Workout, WorkoutSession, WorkoutSet } from '@/types/Workout';
import { Exercise } from '@/types/Exercise';
import { byCreatedAtDesc } from '@/utils/sort';

export default function Component({ params }: { params: { id: string, sessionId: string } }) {
  // console.log('>> app.workout[id].session[sessionId].Page.render()', { id: params.id, sessionId: params.sessionId });
  const router = useRouter();
  const user = useUser((state: any) => state.user);

  const [
    workout,
    workoutLoaded,
    loadWorkout,
    saveWorkout,
  ] = useWorkouts((state: any) => [
    state.get(params.id),
    state.loaded(params.id),
    state.load,
    state.save,
  ]);

  const [
    session,
    startSession,
    sessionLoaded,
    loadSession,
    startSet,
    completeSession,
    stopSession,
    resumeSession,
    deleteSession,
    saveSession,
  ] = useWorkoutSessions((state: any) => [
    state.get(params.sessionId),
    state.startSession,
    state.loaded(params.sessionId),
    state.load,
    state.startSet,
    state.complete,
    state.stop,
    state.resume,
    state.delete,
    state.save,
  ]);

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
  // const [mode, setMode] = useState<SessionMode>({
  //   countdown: session?.mode && session.session?.mode?.countdown || !!workout?.defaultMode?.countdown,
  //   shuffle: session?.mode && session.session?.mode?.shuffle || !!workout?.defaultMode?.shuffle,
  //   repeat: session?.mode && session.session?.mode?.repeat || !!workout?.defaultMode?.repeat,
  // });
  const [previousMode, setPreviousMode] = useState<SessionMode>(session?.mode);
  const targetDuration = workout && currentSet && workout.exercises[currentSet.offset]?.directions?.duration;
  const canNext = sessionStarted && currentSet && workout?.exercises?.length > 0 && (
    session?.mode?.repeat
    || (session?.mode?.shuffle && session.sets.length < workout.exercises.length)
    || (!session?.mode?.shuffle && currentSet.offset < workout.exercises.length - 1));
  const canPrev = sessionStarted && currentSet && workout?.exercises?.length > 0 && (
    session?.mode?.shuffle && session.sets.length > 1 || !session?.mode?.shuffle && currentSet?.offset > 0);

  console.log('>> app.workouts[id].session.Page.render()', { id: params.id, workout, session, currentSet, mode: session?.mode, sets: session?.sets?.length, exercises: workout?.exercises?.length });

  useEffect(() => {
    if (!workoutLoaded) {
      loadWorkout(params.id);
    }

    if (!sessionLoaded || session?.status != "creating") {
      loadSession(params.id, params.sessionId);
    }
  }, [params.id, params.sessionId]);

  useEffect(() => {
    // console.log('>> app.workouts[id].session.Page useEffect(currentSet)', { currentSet, previousSet });
    if (currentSet && (currentSet.id != previousSet?.id || currentSet.status != previousSet?.status || session?.mode.countdown != previousMode?.countdown)) {
      // console.log('>> app.workouts[id].session.Page useEffect(currentSet) KICKOFF TIMER!', { currentSet, timer });

      if (timer) {
        clearInterval(timer);
        setTimer(0);
      }

      timer = setInterval(() => {
        if (currentSet && currentSet.startedAt) {
          // console.log('>> app.workouts[id].session.Page useEffect(currentSet) TIC TOK!', { currentSet, timer });
          const duration = (currentSet.duration || 0) + moment().valueOf() - currentSet.startedAt;

          // console.log('>> app.workouts[id].session.Page useEffect(currentSet) TIC TOK!', { currentSet, timer, duration, targetDuration });

          if (session?.mode?.countdown && targetDuration) {
            setCurrentSetDuration(Math.max(targetDuration - duration + 1000, 1400));
          } else {
            setCurrentSetDuration(duration);
          }

          if (session?.mode?.countdown && duration >= targetDuration) {
            // console.log('>> app.workouts[id].session.Page useEffect(currentSet) NEXT!', { currentSet, timer, duration, targetDuration });

            if (canNext) {
              handleNext();
            } else {
              handleStopSession();
            }
          }
        }
      }, 50) as any;

      // console.log('>> app.workouts[id].session.Page useEffect(currentSet) timer kicked off', { currentSet, timer });

      setTimer(timer);
      setPreviousSet(currentSet);
      setCurrentSetDuration(currentSet.duration);
      setPreviousMode(session?.mode);
    }

    return () => {
      // console.log('>> app.workouts[id].session.Page useEffect(currentSet) KILL TIMER!', { currentSet, timer });
      if (timer) {
        clearInterval(timer);
        setTimer(0);
        setPreviousSet(undefined);
      }
    }
  }, [currentSet?.id, session?.id, session?.status, session?.mode?.countdown]);

  async function handleStartSession() {
    // console.log('>> app.workout[id].session.handleStartSession()', { user, workout });
    startSession(user, workout.id);
  }

  async function handleStopSession() {
    // console.log('>> app.workout[id].session.handleStopSession()', { user, session });
    stopSession(user, session?.id);
  }

  async function handleResumeSession() {
    // console.log('>> app.workout[id].session.handleResumeSession()', { user, session });
    resumeSession(user, session?.id);
  }

  async function handleCompleteSession() {
    // console.log('>> app.workout[id].session.handleCompleteSession()', { user, session });
    completeSession(user, session?.id);
  }

  async function handleDeleteSession() {
    // console.log('>> app.workout[id].session.handleDeleteSession()', { user, session });
    const response = confirm("Delete session?");
    if (response) {
      deleteSession(session?.id);
      router.push(`/workouts/${session?.workout?.id}`);
    }
  }

  async function handleStartSet(offset: number) {
    console.log('>> app.workout[id].session.handleStartSet()', { user, workout, session, offset });

    let _session = session;
    if (!_session) {
      _session = await startSession(user, workout.id);
    }

    return startSet(user, workout.id, _session.id, workout.exercises[offset], offset);
  }

  async function handleNext() {
    if (canNext) {
      let offset = currentSet.offset;
      if (session?.mode?.shuffle) {
        let nextOffsets = Array.from({ length: workout.exercises.length }, (v, i) => i)
          .filter((o) => o != currentSet.offset);

        if (!session?.mode?.repeat) {
          // don't repeat exercises
          const previousOffsets = new Set(session.sets.map((s: WorkoutSet) => s.offset));
          nextOffsets = nextOffsets.filter((i: number) => !previousOffsets.has(i));
        }

        offset = nextOffsets[Math.round(Math.random() * (nextOffsets.length - 1))];
      } else {
        offset++;
        if (session?.mode?.repeat && offset > workout.exercises.length - 1) {
          offset = 0;
        }
      }

      return handleStartSet(offset);
    }
  }

  async function handlePrevious() {
    if (canPrev) {
      let offset = currentSet.offset - 1;
      if (session?.mode?.shuffle) {
        offset = session.sets[offset].offset;
      }

      return handleStartSet(offset);
    }
  }

  async function handleChangeMode(mode: SessionMode) {
    // if (workout && user && workout.exercises && session) {
    //   setMode(mode == "normal" ? "countdown" : "normal");
    // }
    session.mode = mode
    saveSession(user, session);
    saveWorkout(user, { ...workout, defaultMode: mode });
  }

  const links = [
    workout && <Link key="back" href={`/workouts/${workout.id}`}>Back</Link>,
    workout && user && !sessionStarted && (user.uid == workout.createdBy || user.admin) && <Link key="delete" style="warning" onClick={handleDeleteSession}>Delete</Link>,
    workout && user && !session && <Link key="start" onClick={handleStartSession}>Start</Link>,
    workout && user && sessionStarted && <Link key="complete" onClick={handleCompleteSession}>Complete</Link>,
    workout && user && sessionStarted && !sessionPaused && <Link key="pause" onClick={handleStopSession}>Pause</Link>,
    workout && user && session?.status == "stopped" && <Link key="resume" onClick={handleResumeSession}>Resume</Link>,
    canNext && <Link key="next" onClick={handleNext}>Next</Link>,
  ];

  if (!sessionLoaded) {
    return (
      <Page
        bottomLinks={links}
        loading={true}
      />
    )
  }

  if (!session) {
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
      <div className='flex flex-col gap-3 text-center'>
        <span
          className={`font-bold text-6xl transition-all
            ${workout && user && session?.status == "stopped" ? "_bg-pink-200 opacity-30 hover:opacity-100 animate-pulse hover:animate-none opacity- text-dark-1 active:text-light-1" : ""}
            ${workout && user && sessionStarted && !sessionPaused ? "_bg-yellow-200 active:text-light-1" : ""}
            ${session?.status != "completed" ? " text-dark-1 cursor-pointer" : ""}          
          `}
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
              ? handleResumeSession()
              : session?.status == "started"
                ? handleStopSession()
                : null;
          }}
        >
          <Clock ms={
            sessionCompleted && sessionTotal
            || sessionPaused && currentSet && !session?.mode?.countdown && currentSet.duration
            || sessionPaused && currentSet && session?.mode?.countdown && targetDuration - currentSet.duration + 1000
            || currentSetDuration
            || 0
          } />
        </span>

        {workout && user && session?.status != "completed" &&
          <div className="flex flex-col gap-1">
            <div className="flex flex-row relative justify-center items-center gap-2 text-5xl _bg-pink-100">
              {canPrev &&
                <Link onClick={handlePrevious}>
                  <IoPlayBack className="text-dark-2 hover:text-dark-1 active:text-light-1" />
                </Link>
              }
              {!canPrev &&
                <IoPlayBack className="text-dark-2" />
              }
              {workout && user && sessionStarted && !sessionPaused &&
                <Link onClick={handleStopSession}>
                  <IoPause className="text-6xl text-dark-2 hover:text-dark-1 active:text-light-1" />
                </Link>
              }
              {workout && user && sessionStarted && sessionPaused &&
                <Link onClick={handleResumeSession}>
                  <IoPlay className="text-6xl text-dark-2 hover:text-dark-1 active:text-light-1" />
                </Link>
              }
              {!(workout && user && sessionStarted) &&
                <IoPlay className="text-6xl text-dark-2 " />
              }
              {sessionStarted && canNext &&
                <Link onClick={handleNext} >
                  <IoPlayForward className="text-dark-2 hover:text-dark-1 active:text-light-1" />
                </Link>
              }
              {!(sessionStarted && canNext) &&
                <IoPlayForward className="text-dark-2" />
              }
            </div>
            <div className="flex flex-row relative justify-center items-center gap-2 text-[1.2rem] _bg-pink-100">
              <Link
                title="Countdown mode"
                style={session?.mode?.countdown ? "" : "light"}
                onClick={() => handleChangeMode({ ...session?.mode, countdown: !session?.mode?.countdown })}
              >
                <TbClockPlay className={`${session?.mode?.countdown ? "text-dark-1" : "text-dark-2"} hover:text-dark-1 active:text-light-1`} />
              </Link>
              <Link
                title="Shuffle mode"
                style={session?.mode?.shuffle ? "" : "light"}
                onClick={() => handleChangeMode({ ...session?.mode, shuffle: !session?.mode?.shuffle })}
              >
                <FaShuffle className={`${session?.mode?.shuffle ? "text-dark-1" : "text-dark-2"} hover:text-dark-1 active:text-light-1`} />
              </Link>
              <Link
                title="Repeat mode"
                style={session?.mode?.repeat ? "" : "light"}
                onClick={() => handleChangeMode({ ...session?.mode, repeat: !session?.mode?.repeat })}
              >
                <FaRepeat className={`${session?.mode?.repeat ? "text-dark-1" : "text-dark-2"} hover:text-dark-1 active:text-light-1`} />
              </Link>
            </div>
          </div>
        }
      </div>

      {session && session.status != "completed" && workout && workout.exercises && workout.exercises.length > 0 &&
        <div className="pt-2">
          <div className="self-center flex flex-col gap-1 p-2 _-mr-8 _bg-pink-200">
            {
              workout.exercises
                // .sort(byName)
                .map((exercise: Exercise, i: number) => {
                  return (
                    <Link
                      key={i}
                      style="primary"
                      className="_bg-yellow-200 mx-auto text-2xl"
                      onClick={() => handleStartSet(i)}
                    >
                      <div
                        className={`_text-dark-1 flex flex-row _flex-nowrap max-w-[calc(100vw-2rem)] ${i == currentSet?.offset && sessionStarted && !sessionPaused ? " text-dark-1 font-bold" : " font-semibold"}`}
                      >
                        {i == currentSet?.offset &&
                          <div>{">> "}</div>
                        }
                        <div className="truncate text-ellipsis capitalize px-1">
                          {exercise.name}
                        </div>
                        {i == currentSet?.offset &&
                          <div>{" <<"}</div>
                        }
                      </div>
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
