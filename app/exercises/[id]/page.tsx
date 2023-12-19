'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import BackLink from '@/app/_components/BackLink';
import Link from "@/app/_components/Link"
import { Page, PageLinks } from "@/app/_components/Page";
import useExercises from "@/app/_hooks/exercises";
import useUser from "@/app/_hooks/user";
import Loading from "./loading";

function ExerciseVariation({ name, description, instructions, level, showDetails }: any) {
  const [showDetail, setshowDetail] = useState(false);

  // console.log('>> app.exercises[id].page.render()', { name, shortIngredients, ingredients });

  useEffect(() => {
    if (showDetails) {
      setshowDetail(false);
    }
  }, [showDetails]);

  return (
    <div className="flex flex-col gap-0">
      {/* <Link style="parent" onClick={() => !showDetails && setshowDetail(!showDetail)}> */}
      <div className="">
        <span className="capitalize _text-dark-1 font-semibold">{name}{level ? ` (${level})` : ""}</span>
        {description &&
          <>
            : <span className="_opacity-60 _italic">{description}</span>
          </>
        }
        {/* {!showDetails &&
            <>
              <Link style="child light" className="ml-2">{showDetail ? "Hide details" : "Show details"}</Link>
            </>
          } */}
      </div>
      {/* {description &&
        <div className="_opacity-60 _italic">
          {description}
        </div>
      } */}
      {instructions &&
        // <div className="_opacity-60 _italic">
        //   {instructions}
        // </div>
        <ul className="list-disc ml-6 mt-1">
        {
          instructions
            .split(/\.\s?/)
            .map((step: string) => step.trim())
            .filter(Boolean)
            .map((step: string) => <li>{step}</li>)
        }
      </ul>

      }
      {/* </link> */}
    </div>
  );
}

function Exercise({ id, instructions, variations, showDetails }: any) {
  return (
    <p className="text-left pb-4 flex flex-col gap-4">
      {instructions &&
        <div className="flex flex-col _gap-2">
          {/* <div className="text-dark-1 font-bold">Instructions</div> */}
          <h2>Instructions</h2>
          <ul className="list-disc ml-6">
            {
              instructions
                .split(/\.\s?/)
                .map((step: string) => step.trim())
                .filter(Boolean)
                .map((step: string) => <li>{step}</li>)
            }
          </ul>
        </div>
      }
      {variations && variations.length > 0 &&
        <div className="flex flex-col _gap-2">
          {/* <div className="text-dark-1 font-bold">Variations</div> */}
          <h2>Variations</h2>
          <div className="flex flex-col gap-3">
            {
              variations
                // .sort((a: Post, b: Post) => b.postedAt.valueOf() - a.postedAt.valueOf())
                .map((item: any, offset: number) => (
                  <div key={offset}>
                    <ExerciseVariation {...{ ...item, offset, showDetails }} />
                  </div>
                )
                )
            }
          </div>
        </div>
      }
    </p>
  );
}

async function handleDeleteExercise(id: string, deleteFn: any, router: any) {
  const response = confirm("Delete exercise?");
  if (response) {
    deleteFn(id);
    router.back();
  }
}

export default function Component({ params }: { params: { id: string } }) {
  // console.log('>> app.trivia[id].page.render()', { id: params.id });
  const router = useRouter();
  const [showDetails, setshowDetails] = useState(false);
  const [exercises, loaded, load, deleteExercise] = useExercises((state: any) => [state.exercises, state.loaded, state.load, state.deleteExercise]);
  const [user] = useUser((state: any) => [state.user]);
  const exercise = exercises.filter((exercise: any) => exercise.id == params.id)[0];

  console.log('>> app.exercises[id].page.render()', { id: params.id, exercise });

  useEffect(() => {
    load(params.id);
  }, [params.id]);

  if (!loaded) {
    return <Loading />
  }

  const links = (
    <PageLinks>
      <BackLink />
      {/* {exercise && <Link onClick={() => setshowDetails(!showDetails)}>{showDetails ? "Hide details" : "Show details"}</Link>} */}
      {/* {game && <Link onClick={() => handlePlayGame(params.id, startGame, router)}>Play</Link>} */}
      {exercise && user && (user.uid == exercise.createdBy || user.admin) && <Link style="warning" onClick={() => handleDeleteExercise(params.id, deleteExercise, router)}>Delete</Link>}
    </PageLinks>
  );

  if (!exercise) {
    return (
      <main className="flex flex-col">
        <h1 className="text-center">Exercise {params.id} not found</h1>
        {links}
      </main>
    )
  }

  return (
    <Page>
      <h1 className="text-center capitalize">{exercise.name}</h1>
      {exercise.description &&
        <p className='italic text-center'>
          {exercise.description}
        </p>
      }
      <div className="mt-4 mb-6">
        {links}
      </div>
      {exercise &&
        <Exercise {...{ ...exercise, showDetails }} />
      }
      <div className="flex flex-grow items-end justify-center h-full mt-2">
        {links}
      </div>
    </Page>
  )
}
