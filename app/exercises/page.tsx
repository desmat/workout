'use client'

import { User } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from "react";
import FilterButton from '@/app/_components/FilterButton';
import { ExerciseEntry } from '@/app/_components/Exercise';
import Link from "@/app/_components/Link"
import { Page, PageLinks } from "@/app/_components/Page";
import useExercises from '@/app/_hooks/exercises';
import useUser from '@/app/_hooks/user';
import { Exercise, SuggestedExerciseTypes } from "@/types/Exercise"
import Loading from "./loading";
import { byName } from '@/utils/sort';
// import { sortByName } from '@/utils/arrays';

async function handleCreateExercise(createExercise: any, router: any, user: User | undefined) {
  // console.log("*** handleCreateGame", { user, name: user.displayName?.split(/\s+/) });
  // const userName = (user && !user.isAnonymous && user.displayName)
  //   ? `${user.displayName.split(/\s+/)[0]}'s`
  //   : "A";

  const name = window.prompt("Name?", "");

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
  const params = useSearchParams();
  const uidFilter = params.get("uid");
  const filteredExercises = uidFilter ? exercises.filter((exercise: Exercise) => exercise.createdBy == uidFilter) : exercises;

  console.log('>> app.trivia.page.render()', { loaded, exercises });

  useEffect(() => {
    load();
  }, []);

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
