'use client'

import { byName } from '@desmat/utils/sort';
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from "react";
import DailySummaryChart from '@/app/_components/charts/HistoricalWorkoutSessionsHeatmap';
import Link from "@/app/_components/Link"
import Page from "@/app/_components/Page";
import useAlert from '@/app/_hooks/alert';
import useUser from '@/app/_hooks/user';
import useWorkouts from '@/app/_hooks/workouts';
import useWorkoutSessions from '@/app/_hooks/workoutSessions';
import { handleCreateWorkout, handleGenerateWorkout } from '@/app/_utils/handlers';
import { Workout, WorkoutSession } from "@/types/Workout"
import { Exercise } from '@/types/Exercise';

function Graph({ sessions }: any) {
  console.log('>> app.workouts.Graph.render()', { sessions });

  return (
    <div className="flex flex-col items-center gap-3 max-w-[53rem] w-[calc(100vw-32px)]">
      {/* <div className="text-dark-0 opacity-40">Historical</div> */}
      <div className="flex flex-col gap-0 w-full">
        <DailySummaryChart sessions={sessions} />
      </div>
    </div>
  );
}

function WorkoutEntry({ workout, user }: any) {
  const isReady = ["created", "saved"].includes(workout?.status);
  const maxSummaryItems = 5;
  const uniqueExerciseNames = workout.exercises
    ? Array.from(new Set(workout.exercises.map((e: Exercise) => e.name)))
    : [];
  const summary = uniqueExerciseNames.length > 0
    ? uniqueExerciseNames.sort().slice(0, maxSummaryItems).join(", ")
    : "";
  const summaryMore = uniqueExerciseNames.length > maxSummaryItems
    ? ` and ${workout.exercises.length - maxSummaryItems} more`
    : "";
  // console.log('>> app.workouts.page.WorkoutEntry.render()', { workout, user, summary });

  return (
    <Link style="parent" href={`/workouts/${workout.id}`}>
      <span className="m-0">
        <span className="capitalize font-semibold">{workout.name}</span>
        {isReady &&
          <>
            <span>
              <span className="capitalize">{` (${summary}`}</span>{summaryMore})
            </span>
            <span className="relative px-2">
              <Link style="child light" className="absolute left-1.5">View</Link>
            </span>
          </>
        }
        {!isReady &&
          <span className="capitalize animate-pulse">{` (${workout.status || "unknown"}...)`}</span>
        }
      </span>
    </Link>
  );
}

export default function Component() {
  const router = useRouter();
  const params = useSearchParams();
  const uidFilter = params.get("uid");
  const query = uidFilter && { createdBy: uidFilter };

  const [
    user,
    userLoaded
  ] = useUser((state: any) => [
    state.user,
    state.loaded
  ]);

  const [
    workouts,
    workoutsLoaded,
    load,
    createWorkout,
    generateWorkout,
  ] = useWorkouts((state: any) => [
    state.find(),
    state.loaded(query) || state.loaded(), // smooth transition between unfiltered and filtered view (loaded with query is subset of loaded all)    
    state.load,
    state.create,
    state.generate,
  ]);

  const [
    startSession,
    sessions,
    sessionsLoaded,
    loadSessions
  ] = useWorkoutSessions((state: any) => [
    state.start,
    state.find(),
    state.loaded(),
    state.load
  ]);

  const [
    info,
    success
  ] = useAlert((state: any) => [
    state.info,
    state.success
  ]);

  const loaded = userLoaded && workoutsLoaded // && sessionsLoaded;
  const filteredWorkouts = loaded && uidFilter && workouts.filter((workout: Workout) => workout.createdBy == uidFilter) || workouts;
  const filteredSessions = sessionsLoaded && sessions.filter((session: WorkoutSession) => session.createdBy == user.uid);
  // console.log('>> app.trivia.page.render()', { uidFilter, loaded, workouts });

  useEffect(() => {
    if (userLoaded) {
      load(query);
      loadSessions();
    }
  }, [uidFilter, userLoaded]);

  const title = uidFilter ? "My Workouts" : "Workouts";

  const subtitle = (
    <>
      Let us create your perfect workout!
      <br />
      Simply answer a few questions and our trained AI will do the rest!
    </>
  )

  const links = [
    <div key="create" title={user ? "" : "Login to create new workout"}>
      <Link
        className={user ? "" : "cursor-not-allowed"}
        onClick={() => user && handleCreateWorkout(createWorkout, router, user)}
      >
        Create
      </Link>
    </div>,
    <div key="generate" title={user ? "" : "Login to generate a workout"}>
      <Link
        className={user ? "" : "cursor-not-allowed"}
        onClick={() => user && handleGenerateWorkout(generateWorkout, router, user, info, success)}
      >
        Generate
      </Link>
    </div>,
    uidFilter && <Link key="showall" href={`/workouts`}>Show All</Link>,
    !uidFilter && <Link key="filer" href={`/workouts?uid=${user?.uid || ""}`}>Filter</Link>,
  ];

  if (!loaded) {
    return (
      <Page
        title={title}
        subtitle={subtitle}
        loading={true}
      />
    )
  }

  return (
    <>
      <Page
        title={title}
        subtitle={subtitle}
        links={links}
      >
        {/* <FilterButton href="/workouts" onClick={() => setFiltered(!isFiltered)} userId={user?.uid} isFiltered={isFiltered} /> */}

        {filteredSessions && filteredSessions.length > 0 &&
          <div className="self-center flex flex-col gap-3">
            <Graph sessions={sessions} />
          </div>
        }
        {filteredWorkouts && filteredWorkouts.length > 0 &&
          <div className="self-center flex flex-col gap-3">
            {
              filteredWorkouts
                .sort(byName)
                .map((workout: any) => {
                  return (
                    <div key={workout.id}>
                      <WorkoutEntry workout={workout} user={user} />
                    </div>
                  )
                })
            }
          </div>
        }
        {(!filteredWorkouts || filteredWorkouts.length == 0) &&
          <>
            {uidFilter &&
              <p className='italic text-center'>
                <span className="opacity-50">No workouts created yet</span> <span className="not-italic">😞</span>
                <br />
                <span className="opacity-50">You can create or generate one, or show all with the links above.</span>
              </p>
            }
            {!uidFilter &&
              <p className='italic text-center'>No workouts yet :(</p>
            }
          </>
        }
      </Page>
    </>
  )
}
