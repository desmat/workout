'use client'

import { User } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from "react";
import FilterButton from '@/app/_components/FilterButton';
import Link from "@/app/_components/Link"
import { Page, PageLinks } from "@/app/_components/Page";
import useAlert from '../_hooks/alert';
import useExercises from '@/app/_hooks/exercises';
import useUser from '@/app/_hooks/user';
import { Exercise, ExerciseItem, SuggestedExerciseTypes } from "@/types/Exercise"
import Loading from "./loading";
import { byName } from '@/utils/sort';
// import { sortByName } from '@/utils/arrays';

function ExerciseEntry({ exercise, user }: any) {
  const isReady = ["created"].includes(exercise.status);
  const maxSummaryItems = 3;
  const summary = exercise?.items?.length > 0
    ? exercise?.items?.length > maxSummaryItems
      ? exercise.items.slice(0, maxSummaryItems).map((item: ExerciseItem) => item.name).join(", ") + ` and ${exercise.items.length - maxSummaryItems} more`
      : exercise?.items?.map((item: ExerciseItem) => item.name).join(", ") || ""
    : "";
  console.log('>> app.exercises.page.ExerciseEntry.render()', { exercise, user, summary });

  return (
    <Link style="parent" href={`/exercises/${exercise.id}`}>
      <span className="m-0">
        <span className="capitalize font-semibold">{exercise.name}</span>
        {isReady &&
          <>
            {/* {` (${summary})`} */}
            <Link style="child light" className="ml-2 absolute">View</Link>
          </>
        }
        {!isReady &&
          <>
            {` (${exercise.status})`}
          </>
        }
      </span>
    </Link>
  );
}

async function handleCreateExercise(createExercise: any, router: any, user: User | undefined) {
  // console.log("*** handleCreateGame", { user, name: user.displayName?.split(/\s+/) });
  // const userName = (user && !user.isAnonymous && user.displayName)
  //   ? `${user.displayName.split(/\s+/)[0]}'s`
  //   : "A";

  const name = window.prompt("Name?", "Foo bar");

  if (name) {
    const id = await createExercise(user, name);

    if (id) {
      // router.push(`/exercises/${id}`);
      return true
    }

  }

  return false;
}

export default function Component() {
  const router = useRouter();
  const [user] = useUser((state: any) => [state.user]);
  const [exercises, loaded, load, createExercise, error] = useExercises((state: any) => [state.exercises, state.loaded, state.load, state.createExercise, state.error]);
  const [alertError] = useAlert((state: any) => [state.error]);
  const params = useSearchParams();
  const uidFilter = params.get("uid");
  const filteredExercises = uidFilter ? exercises.filter((exercise: Exercise) => exercise.createdBy == uidFilter) : exercises;

  console.log('>> app.trivia.page.render()', { loaded, exercises });

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (error) {
      alertError(error);
    }
  }, [error]);

  const links = (
    <PageLinks>
      <div title={user ? "" : "Login to create new exercise"}>
        <Link
          className={user ? "" : "cursor-not-allowed"}
          onClick={() => /* user && */ handleCreateExercise(createExercise, router, user)}
        >
          Create New Exercise
        </Link>
      </div>
      {/* <Link>View Leaderboard</Link> */}
    </PageLinks>
  );

  if (!loaded) {
    return <Loading />
  }

  return (
    <Page>
      <FilterButton href="/exercises" userId={user?.uid} isFiltered={!!uidFilter} />

      <h1 className="text-center">Exercises</h1>

      <p className='italic text-center'>
        Let ChatGPT create exercises for you!
      </p>
      {/* <p className='italic text-center'>
          Try these: {SuggestedExerciseTypes.join(", ")}
        </p> */}
      <div className="mt-4 mb-6">
        {links}
      </div>

      {filteredExercises && filteredExercises.length > 0 &&
        <div className="self-center flex flex-col gap-3">
          {
            filteredExercises
              // .filter(...)
              .sort(byName)
              .map((exercise: any) => {
                return (
                  <span key={exercise.id}>
                    <ExerciseEntry exercise={exercise} user={user} />
                  </span>)
              })
          }
        </div>
      }
      {(!filteredExercises || filteredExercises.length == 0) &&
        <p className='italic text-center'>No exercises yet :(</p>
      }
      <div className="flex flex-grow items-end justify-center h-full mt-2">
        {links}
      </div>
    </Page>

  )
}
