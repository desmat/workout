'use client'

import { User } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from "react";
import FilterButton from '@/app/_components/FilterButton';
import Link from "@/app/_components/Link"
import useWorkouts from '@/app/_hooks/workouts';
import useUser from '@/app/_hooks/user';
import { Workout, WorkoutSession, WorkoutSet } from "@/types/Workout"
import Loading from "./loading";
import { Exercise } from '@/types/Exercise';
import { byCreatedAt, byCreatedAtDesc, byName } from '@/utils/sort';

function WorkoutEntry({ workout, user }: any) {
  const isReady = ["created"].includes(workout.status);
  const maxSummaryItems = 3;
  const summary = workout?.exercises?.length > 0
    ? workout?.exercises?.length > maxSummaryItems
      ? workout.exercises.sort(byName).slice(0, maxSummaryItems).map((exercise: Exercise) => exercise.name).join(", ") + ` and ${workout.exercises.length - maxSummaryItems} more`
      : workout?.exercises?.map((exercise: Exercise) => exercise.name).join(", ") || ""
    : "";
  console.log('>> app.workouts.page.WorkoutEntry.render()', { workout, user, summary });

  return (
    <Link style="parent" href={`/workouts/${workout.id}`}>
      <span className="m-0">
        <span className="capitalize font-semibold">{workout.name}</span>
        {isReady &&
          <>
            <span className="capitalize">{` (${summary})`}</span>
            <Link style="child light" className="ml-2 absolute">View</Link>
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

async function handleCreateWorkout(createWorkout: any, router: any, user: User | undefined) {
  // console.log("*** handleCreateGame", { user, name: user.displayName?.split(/\s+/) });
  // const userName = (user && !user.isAnonymous && user.displayName)
  //   ? `${user.displayName.split(/\s+/)[0]}'s`
  //   : "A";

  const name = window.prompt("Name?", "");

  if (name) {
    const exercises = window.prompt("Exercises?", "Push ups, Pull ups, sit ups");

    if (exercises) {
      const id = await createWorkout(user, name, exercises);

      if (id) {
        // router.push(`/workouts/${id}`);
        return true
      }
    }
  }

  return false;
}

export default function Page() {
  const router = useRouter();
  const [user] = useUser((state: any) => [state.user]);
  const [workouts, loaded, load, createWorkout] = useWorkouts((state: any) => [state.workouts, state.loaded, state.load, state.createWorkout]);
  const params = useSearchParams();
  const uidFilter = params.get("uid");
  const filteredWorkouts = uidFilter ? workouts.filter((workout: Workout) => workout.createdBy == uidFilter) : workouts;

  console.log('>> app.trivia.page.render()', { loaded, workouts });

  useEffect(() => {
    load();
  }, []);

  const links = (
    <div className="flex flex-row gap-3 items-center justify-center mt-2 mb-4">
      <div title={user ? "" : "Login to create new workout"}>
        <Link className={user ? "" : "cursor-not-allowed"} onClick={() => /* user && */ handleCreateWorkout(createWorkout, router, user)}>
          Create New Workout
        </Link>
      </div>
      {/* <Link>View Leaderboard</Link> */}
    </div>
  );

  if (!loaded) {
    return <Loading />
  }

  return (
    <>
      <main className="flex flex-col items-left lg:max-w-4xl lg:mx-auto px-4">
        <FilterButton href="/workouts" userId={user?.uid} isFiltered={!!uidFilter} />

        <h1 className="text-center">Workouts</h1>

        <p className='italic text-center'>
          Let ChatGPT create workouts for you!
        </p>
        {/* <p className='italic text-center'>
          Try these: {SuggestedWorkoutTypes.join(", ")}
        </p> */}
        {links}
        {filteredWorkouts && filteredWorkouts.length > 0 &&
          <div className="self-center flex flex-col gap-3">
            {
              filteredWorkouts
                // .filter(...)
                .sort(byCreatedAtDesc)
                .map((workout: any) => {
                  return (
                    <span key={workout.id}>
                      <WorkoutEntry workout={workout} user={user} />
                    </span>
                  )
                })
            }
          </div>
        }
        {(!filteredWorkouts || filteredWorkouts.length == 0) &&
          <p className='italic text-center'>No workouts yet :(</p>
        }
        {filteredWorkouts && filteredWorkouts.length > 4 && links}
      </main>
    </>
  )
}
