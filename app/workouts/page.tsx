'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from "react";
import FilterButton from '@/app/_components/FilterButton';
import Link from "@/app/_components/Link"
import Page from "@/app/_components/Page";
import useAlert from '@/app/_hooks/alert';
import useUser from '@/app/_hooks/user';
import useWorkouts from '@/app/_hooks/workouts';
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
  const [user, userLoaded] = useUser((state: any) => [state.user, state.loaded]);
  const [workouts, workoutsLoaded, load, createWorkout, generateWorkout] = useWorkouts((state: any) => [state.workouts, state.loaded, state.load, state.createWorkout, state.generateWorkout]);
  const loaded = userLoaded && workoutsLoaded;
  const [info, success] = useAlert((state: any) => [state.info, state.success]);
  const params = useSearchParams();
  const uidFilter = params.get("uid");
  const filteredWorkouts = loaded && uidFilter && workouts.filter((workout: Workout) => workout.createdBy == uidFilter) || workouts;

  console.log('>> app.workouts.page.render()', { uidFilter, loaded, workouts });

  useEffect(() => {
    if (userLoaded) {
      if (uidFilter) {
        load({ createdBy: uidFilter });
      } else {
        load();
      }
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
    <div key="0" title={user ? "" : "Login to create new workout"}>
      <Link
        className={user ? "" : "cursor-not-allowed"}
        onClick={() => user && handleCreateWorkout(createWorkout, router, user)}
      >
        Create
      </Link>
    </div>,
    <div key="1" title={user ? "" : "Login to generate a workout"}>
      <Link
        className={user ? "" : "cursor-not-allowed"}
        onClick={() => user && handleGenerateWorkout(generateWorkout, router, user, info, success)}
      >
        Generate
      </Link>
    </div>,
    uidFilter && <Link key="1" href={`/workouts`}>Show All</Link>,
    !uidFilter && <Link key="2" href={`/workouts?uid=${user?.uid || ""}`}>Filter</Link>,
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
