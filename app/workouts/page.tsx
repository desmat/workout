'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from "react";
import FilterButton from '@/app/_components/FilterButton';
import Link from "@/app/_components/Link"
import Page from "@/app/_components/Page";
import useWorkouts from '@/app/_hooks/workouts';
import useUser from '@/app/_hooks/user';
import { handleCreateWorkout, handleGenerateWorkout } from '@/app/_utils/handlers';
import { Workout } from "@/types/Workout"
import { Exercise } from '@/types/Exercise';
import { byName } from '@/utils/sort';

function WorkoutEntry({ workout, user }: any) {
  const isReady = ["created"].includes(workout.status);
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
  console.log('>> app.workouts.page.WorkoutEntry.render()', { workout, user, summary });

  return (
    <Link style="parent" href={`/workouts/${workout.id}`}>
      <span className="m-0">
        <span className="capitalize font-semibold">{workout.name}</span>
        {isReady &&
          <>
            <span>
              <span className="capitalize">{` (${summary}`}</span>
              {summaryMore})
            </span>
            <span className="relative px-4">
              <Link style="child light" className="absolute right-0 -mr-3">View</Link>
            </span>
          </>
        }
        {!isReady &&
          <>
            {` (${workout.status})`}
          </>
        }
      </span>
    </Link>
  );
}

export default function Component() {
  const router = useRouter();
  const [user] = useUser((state: any) => [state.user]);
  const [workouts, loaded, load, createWorkout, generateWorkout] = useWorkouts((state: any) => [state.workouts, state.loaded, state.load, state.createWorkout, state.generateWorkout]);
  const params = useSearchParams();
  const uidFilter = params.get("uid");
  const filteredWorkouts = uidFilter && workouts ? workouts.filter((workout: Workout) => workout.createdBy == uidFilter) : workouts;

  console.log('>> app.trivia.page.render()', { loaded, workouts });

  useEffect(() => {
    if (uidFilter) {
      load({ createdBy: uidFilter });
    } else {
      load();
    }
  }, [uidFilter]);

  const title = "Workouts"

  const subtitle = (
    <>
      Let ChatGPT create workouts for you!
      <br />
      Simply provide a list of exercise names and our trained AI will fill in the rest!
    </>
  )

  const links = [
    <div key="0" title={user ? "" : "Login to create new workout"}>
      <Link
        className={user ? "" : "cursor-not-allowed"}
        onClick={() => user && handleCreateWorkout(createWorkout, router, user)}
      >
        Create
      </Link>
    </div>,
    <div key="0" title={user ? "" : "Login to generate a workout"}>
      <Link
        className={user ? "" : "cursor-not-allowed"}
        onClick={() => user && handleGenerateWorkout(generateWorkout, router, user)}
      >
        Generate
      </Link>
    </div>
    // <Link key="1">View Leaderboard</Link>,
  ];

  if (!loaded) {
    return (
      <Page
        title={title}
        subtitle={subtitle}
        // links={[<BackLink key="0" />]}
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
        <FilterButton href="/workouts" userId={user?.uid} isFiltered={!!uidFilter} />

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
          <p className='italic text-center'>No workouts yet :(</p>
        }
      </Page>
    </>
  )
}
