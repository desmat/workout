'use client'

import { User } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from "react";
import { ExerciseEntry } from '@/app/_components/Exercise';
import Link from "@/app/_components/Link"
import Page from "@/app/_components/Page";
import useExercises from '@/app/_hooks/exercises';
import useUser from '@/app/_hooks/user';
import { Exercise } from "@/types/Exercise"
import { byName } from '@/utils/sort';

async function handleCreateExercise(createExercise: any, generateExercise: any, router: any, user: User | undefined) {
  const name = window.prompt("Name?", "");

  if (name) {
    const created = await createExercise(user, name);
    // console.log("*** handleCreateExercise", { created });

    if (created) {
      const generating = generateExercise(user, created);
      // console.log("*** handleCreateExercise", { generating });
      router.push(`/exercises/${created.id}`);
      return true
    }
  }

  return false;
}

export default function Component() {
  const router = useRouter();
  const [user] = useUser((state: any) => [state.user]);
  const [exercises, loaded, load, createExercise, generateExercise] = useExercises((state: any) => [state.exercises, state.loaded, state.load, state.createExercise, state.generateExercise]);
  const params = useSearchParams();
  const uidFilter = params.get("uid");
  const filteredExercises = uidFilter && exercises ? exercises.filter((exercise: Exercise) => exercise.createdBy == uidFilter) : exercises;

  console.log('>> app.trivia.page.render()', { loaded, exercises });

  useEffect(() => {
    if (uidFilter) {
      load({ createdBy: uidFilter });
    } else {
      load();
    }
  }, [uidFilter]);

  const title = uidFilter ? "My Exercises" : "Exercises"

  const subtitle = "Let ChatGPT create exercises for you!";

  const links = [
    <div key="0" title={user ? "" : "Login to create new exercise"}>
      <Link
        className={user ? "" : "cursor-not-allowed"}
        onClick={() => /* user && */ handleCreateExercise(createExercise, generateExercise, router, user)}
      >
        Create New Exercise
      </Link>
    </div>,
    uidFilter && <Link key="1" href={`/exercises`}>Show All</Link>,
    !uidFilter && <Link key="2" href={`/exercises?uid=${user?.uid || ""}`}>Filter</Link>,
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
    <Page
      title={title}
      subtitle={subtitle}
      links={links}
      loading={!loaded}
    >
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
        <>
          {uidFilter &&
            <p className='italic text-center'>
              <span className="opacity-50">No exercises created yet</span> <span className="not-italic opacity-100">😞</span>
              <br />
              <span className="opacity-50">You can create one, or show all with the links above.</span>
            </p>
          }
          {!uidFilter &&
            <p className='italic text-center opacity-50'>No workouts yet :(</p>
          }
        </>
      }
    </Page>
  )
}
