'use client'

import { byName } from '@desmat/utils/sort';
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from "react";
import { ExerciseEntry } from '@/app/_components/Exercise';
import Link from "@/app/_components/Link"
import Page from "@/app/_components/Page";
import useExercises from '@/app/_hooks/exercises';
import useUser from '@/app/_hooks/user';

export default function Component() {
  const router = useRouter();
  const params = useSearchParams();
  const uidFilter = params.get("uid");
  const query = uidFilter && { createdBy: uidFilter };
  const user = useUser((state: any) => state.user);

  const [
    exercises,
    loaded,
    load,
    create,
    generate, 
    _loaded,
  ] = useExercises((state: any) => [
    state.find(query),
    state.loaded(query) || state.loaded(), // smooth transition between unfiltered and filtered view (loaded with query is subset of loaded all)
    state.load,
    state.create,
    state.generate, 
    state._loaded,
  ]);

  console.log('>> app.trivia.page.render()', { loaded, exercises, _loaded });

  useEffect(() => {
    load(query);
  }, [uidFilter]);

  async function handleCreate() {
    const name = window.prompt("Name?", "");

    if (name) {
      const created = await create(user, name);
      // console.log("*** handleCreate", { created });

      if (created) {
        const generating = generate(user, created);
        // console.log("*** handleCreate", { generating });
        router.push(`/exercises/${created.id}`);
        return true
      }
    }

    return false;
  }

  const title = uidFilter ? "My Exercises" : "Exercises"

  const subtitle = "Let ChatGPT create exercises for you!";

  const links = [
    <div key="generate" title={user ? "" : "Login to create new exercise"}>
      <Link
        className={user ? "" : "cursor-not-allowed"}
        onClick={handleCreate}
      >
        Add
      </Link>
    </div>,
    uidFilter && <Link key="showall" href={`/exercises`}>Show All</Link>,
    !uidFilter && <Link key="filter" href={`/exercises?uid=${user?.uid || ""}`}>Filter</Link>,
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
      {exercises.length > 0 &&
        <div className="self-center flex flex-col gap-3">
          {
            exercises
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
      {exercises.length == 0 &&
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
